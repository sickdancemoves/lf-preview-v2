# Abrir Conta PJ — offline CRM

When someone submits the **Abrir Conta PJ** form, three things happen:

1. They see the on-page confirmation panel (already built into the site).
2. Their 5 document groups are saved into a **per-company dated folder** in Drive
   (`<Razão social> - MM.DD.YY`).
3. A **row is appended** to the master spreadsheet — every form field, a link to
   that folder, and the submission timestamp — and the team gets an **email**.

It's a manual/offline CRM: the team works each row by hand using the tracking
columns on the right (KYC, First Response, Credentials, User ID, Owner).

## What already exists (in the LaFinteca Workspace Drive — `d.ampuero@la-finteca.com`)

| Object | ID | Link |
|--------|----|------|
| Root folder | `1bFru8AUGNe5jejaANOcb8KxYoCZn4qZF` | https://drive.google.com/drive/folders/1bFru8AUGNe5jejaANOcb8KxYoCZn4qZF |
| Uploads folder | `1aMrFq8HizDWsqqx8bETyemmYQi0pIp6J` | https://drive.google.com/drive/folders/1aMrFq8HizDWsqqx8bETyemmYQi0pIp6J |
| Master sheet | `1G6rLxXpOxAWQyT9s32AHmm9yuadW-PiSMVFul83bTsg` | https://docs.google.com/spreadsheets/d/1G6rLxXpOxAWQyT9s32AHmm9yuadW-PiSMVFul83bTsg/edit |

These IDs are already wired into [`Code.gs`](./Code.gs).

### Master sheet columns

```
Timestamp · CNPJ · Razão Social · Nome Fantasia · E-mail · Celular ·
Faturamento Médio Mensal · Data de Abertura · Ramo de Atividade ·
Categoria da Empresa · CNAE · Inscrição Estadual · IE Isenta ·
Pasta de Documentos · Documentos Enviados ·
KYC · First Response · Credentials · User ID · Owner
```

The script fills the first 15 columns. The last 5 are **manual**.

## Deploy (one time, ~2 minutes)

> Do this signed in as **`d.ampuero@la-finteca.com`** — the script must run as the
> account that owns the folders/sheet above.

1. Open <https://script.new> (or the sheet → **Extensions ▸ Apps Script**).
2. Delete the placeholder, paste the contents of [`Code.gs`](./Code.gs), **Save**.
3. *(optional)* Run **`setupValidations`** once to add the KYC / First Response /
   Credentials dropdowns to the sheet. Approve the permission prompt.
4. **Deploy ▸ New deployment ▸** gear ▸ **Web app**:
   - **Execute as:** Me (`d.ampuero@la-finteca.com`)
   - **Who has access:** Anyone
   - **Deploy**, approve the permission prompt, **copy the Web app URL**
     (`https://script.google.com/macros/s/AKfyc.../exec`).
5. Paste that URL into **`assets/js/site.js`** → `const ENDPOINT = '...'` (top of
   the Abrir Conta block), rebuild (`node build.js`), and ship.

Sanity check: open the `/exec` URL in a browser — you should see
`{"result":"ok","service":"LaFinteca Abrir Conta CRM"}`.

## How the wiring works

- The browser reads each uploaded file as base64 and POSTs a JSON payload
  (`{ id, submittedAt, fields, files[] }`) to the web app.
- It posts `text/plain` with no custom headers (a CORS "simple request", so no
  preflight) in `no-cors` mode, then shows the confirmation panel. A copy of each
  submission (without file bytes) is also kept in the visitor's `localStorage` as
  a safety net.
- The server is **idempotent on `id`** (tracked in Script Properties), so an
  accidental re-send never creates a duplicate folder or row.

## Updating after code changes

Editing `Code.gs` isn't live until you redeploy: **Deploy ▸ Manage deployments ▸**
edit the existing deployment ▸ **Version: New version ▸ Deploy**. The `/exec` URL
stays the same, so no site change is needed.

## When you go live

Swap `SPREADSHEET_ID` / `UPLOADS_FOLDER_ID` in `Code.gs` for the final company
folder you provision, redeploy, and (if the account changes) re-approve.
