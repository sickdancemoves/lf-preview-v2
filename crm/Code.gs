/**
 * LaFinteca — Abrir Conta PJ → offline CRM (Google Sheets + Drive)
 * ----------------------------------------------------------------------------
 * Receives a JSON submission from the Abrir Conta form (assets/js/site.js),
 * then:
 *   1. creates a per-company dated folder under the Uploads folder
 *      ("<Razão social> - MM.DD.YY"),
 *   2. saves every uploaded document into that folder (grouped by doc type),
 *   3. appends one row to the master spreadsheet, with a hyperlink to the
 *      folder and a timestamp,
 *   4. emails the team a notification.
 *
 * The manual-tracking columns (KYC, First Response, Credentials, User ID,
 * Owner) are left blank for the team to fill in by hand.
 *
 * Idempotent on payload.id — re-sending the same submission never creates a
 * duplicate folder or row.
 *
 * DEPLOY: Extensions ▸ Apps Script (or script.new) → paste this file →
 *   Deploy ▸ New deployment ▸ Web app ▸ Execute as: Me ▸ Who has access: Anyone
 *   → copy the /exec URL into ENDPOINT in assets/js/site.js.
 * See crm/README.md for the full walkthrough.
 */

const CONFIG = {
  // Created in the LaFinteca Workspace Drive (d.ampuero@la-finteca.com).
  SPREADSHEET_ID:    '1G6rLxXpOxAWQyT9s32AHmm9yuadW-PiSMVFul83bTsg',
  UPLOADS_FOLDER_ID: '1aMrFq8HizDWsqqx8bETyemmYQi0pIp6J',
  SHEET_NAME:        '',                       // '' = first tab (auto-detected)
  TEAM_EMAIL:        'onboarding@la-finteca.com.br',  // notification recipient
  TIMEZONE:          'America/Sao_Paulo',
  MAX_TOTAL_MB:      35,                        // reject oversized submissions
};

// Friendly labels for each upload box, used in filenames + the sheet summary.
const DOC_LABELS = {
  doc_constituicao:  'Documento de constituição',
  doc_cnpj:          'Cartão CNPJ',
  doc_identificacao: 'Documento de identificação',
  doc_faturamento:   'Comprovante de faturamento',
  doc_endereco:      'Comprovante de endereço',
};

/** Health check — visiting the /exec URL in a browser returns this. */
function doGet() {
  return json_({ result: 'ok', service: 'LaFinteca Abrir Conta CRM' });
}

/** Form submissions land here. */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // serialize concurrent submissions (appendRow + dedupe)
  try {
    const payload = JSON.parse(e.postData.contents);
    const id = String(payload.id || '');
    const f = payload.fields || {};
    const files = payload.files || [];

    // Idempotency: skip if we've already processed this submission id.
    const props = PropertiesService.getScriptProperties();
    const seenKey = 'seen_' + id;
    if (id && props.getProperty(seenKey)) {
      return json_({ result: 'success', duplicate: true, folderUrl: props.getProperty(seenKey) });
    }

    // Guard against oversized payloads (base64 inflates ~33%).
    const approxMb = (e.postData.contents.length / 1.37) / (1024 * 1024);
    if (approxMb > CONFIG.MAX_TOTAL_MB) {
      return json_({ result: 'error', message: 'Submission too large (' + approxMb.toFixed(1) + ' MB).' });
    }

    const submittedAt = payload.submittedAt ? new Date(payload.submittedAt) : new Date();

    // 1) Per-company dated folder: "<Razão social|Nome fantasia> - MM.DD.YY".
    const company = (f.razao_social || f.nome_fantasia || 'Empresa').toString().trim();
    const stamp = Utilities.formatDate(submittedAt, CONFIG.TIMEZONE, 'MM.dd.yy');
    const folderName = sanitize_(company) + ' - ' + stamp;
    const folder = DriveApp.getFolderById(CONFIG.UPLOADS_FOLDER_ID).createFolder(folderName);

    // 2) Save documents. Filenames are prefixed with the doc-type label so they
    //    self-group alphabetically inside the (flat) company folder.
    const savedNames = [];
    files.forEach(file => {
      const label = DOC_LABELS[file.field] || file.field;
      const bytes = Utilities.base64Decode(file.dataBase64);
      const blob = Utilities.newBlob(bytes, file.mimeType || 'application/octet-stream', label + ' — ' + file.name);
      folder.createFile(blob);
      savedNames.push(label + ': ' + file.name);
    });

    // 3) Append a row to the master sheet.
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = (CONFIG.SHEET_NAME && ss.getSheetByName(CONFIG.SHEET_NAME)) || ss.getSheets()[0];
    const folderUrl = folder.getUrl();
    // Column order matches the 20-column master header. The 5 trailing blanks
    // are the manual-tracking columns:
    //   KYC | First Response | Credentials | User ID | Owner
    sheet.appendRow([
      Utilities.formatDate(submittedAt, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss'), // Timestamp
      f.cnpj || '',
      f.razao_social || '',
      f.nome_fantasia || '',
      f.email || '',
      f.celular || '',
      f.faturamento_medio_mensal || '',
      f.data_abertura || '',
      f.ramo_atividade || '',
      f.categoria_empresa || '',
      f.cnae || '',
      f.inscricao_estadual || '',
      (f.inscricao_estadual_isenta ? 'Sim' : ''),
      '',                        // Pasta de Documentos (rich-text link set below)
      savedNames.join('\n'),     // Documentos Enviados
      '', '', '', '', '',        // manual: KYC, First Response, Credentials, User ID, Owner
    ]);

    // Locale-safe folder link: a rich-text link instead of a =HYPERLINK formula
    // (the formula's "," vs ";" separator depends on the spreadsheet locale).
    const lastRow = sheet.getLastRow();
    const link = SpreadsheetApp.newRichTextValue().setText('Abrir pasta').setLinkUrl(folderUrl).build();
    sheet.getRange(lastRow, 14).setRichTextValue(link); // col 14 = Pasta de Documentos

    if (id) props.setProperty(seenKey, folderUrl);

    // 4) Notify the team.
    notify_(f, folderUrl, savedNames);

    return json_({ result: 'success', folderUrl: folderUrl });
  } catch (err) {
    return json_({ result: 'error', message: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

/** Email the team a one-line-per-field summary + the folder link. */
function notify_(f, folderUrl, savedNames) {
  if (!CONFIG.TEAM_EMAIL) return;
  try {
    const subject = 'Nova solicitação de Conta PJ — ' + (f.razao_social || f.nome_fantasia || 'Empresa');
    const body =
      'Nova solicitação de abertura recebida:\n\n' +
      'Razão social: ' + (f.razao_social || '-') + '\n' +
      'Nome fantasia: ' + (f.nome_fantasia || '-') + '\n' +
      'CNPJ: ' + (f.cnpj || '-') + '\n' +
      'E-mail: ' + (f.email || '-') + '\n' +
      'Celular: ' + (f.celular || '-') + '\n' +
      'Faturamento médio mensal: ' + (f.faturamento_medio_mensal || '-') + '\n\n' +
      'Documentos:\n' + (savedNames.length ? '  • ' + savedNames.join('\n  • ') : '  (nenhum)') + '\n\n' +
      'Pasta de documentos: ' + folderUrl + '\n' +
      'Planilha (CRM): https://docs.google.com/spreadsheets/d/' + CONFIG.SPREADSHEET_ID + '/edit\n';
    MailApp.sendEmail(CONFIG.TEAM_EMAIL, subject, body);
  } catch (err) {
    // Never let a mail failure roll back a saved submission.
    console.warn('notify_ failed: ' + err);
  }
}

/** Make a string safe + tidy for a Drive folder name. */
function sanitize_(name) {
  return String(name).replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim().slice(0, 120) || 'Empresa';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * OPTIONAL one-time helper: adds dropdown validations to the manual-tracking
 * columns so the team picks from a fixed list. Run it once from the editor.
 */
function setupValidations() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = (CONFIG.SHEET_NAME && ss.getSheetByName(CONFIG.SHEET_NAME)) || ss.getSheets()[0];
  const lists = {
    16: ['Checking', 'Checked', 'Passed', 'Rejected'], // KYC
    17: ['Contacted', 'In Communication', 'Closed'],    // First Response
    18: ['Pending', 'Created'],                          // Credentials
  };
  const rows = 2000;
  Object.keys(lists).forEach(col => {
    const rule = SpreadsheetApp.newDataValidation().requireValueInList(lists[col], true).setAllowInvalid(false).build();
    sheet.getRange(2, Number(col), rows, 1).setDataValidation(rule);
  });
}
