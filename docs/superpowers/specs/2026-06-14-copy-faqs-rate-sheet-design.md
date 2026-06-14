# Design — Site copy refresh, FAQ sync, About rewrite, form upgrade, rate sheet

**Date:** 2026-06-14
**Repo:** `sickdancemoves/lf-preview-v2` (static site: `pages/` fragments + `partials/` + `build.js` + `pages.config.js`)
**Sources:**
- Copy-updates sheet — `docs.google.com/.../1zJOjiLW9AJ8J-0Wh0JsQ7TJZDNoHLEE7tjrGKF2ZOQE`
- FAQs sheet — `docs.google.com/.../1V8BaqXSCOo9xawsDSGAnGDcLsdZvJ8AE7wqcmHW8FGE`
- Rate-sheet style ref — `Tabela_Geral_Tarifas_2025.pdf` (FitBank)
- Fit$ políticas screenshot (placement ref)

## Decisions locked (from brainstorming)
- **Scope:** everything in the copy doc (copy + functionality items).
- **Brand name:** "LaFinteca" throughout (site has no "Dindix"; FAQ already rebranded).
- **Rate values:** drafted from LaFinteca's known pricing; unknowns flagged for input.
- **Bilingual:** all new/changed copy gets PT + EN (`data-lang` spans).
- **About:** short, on-brand section with the essentials (doc copy treated as competitor best-practice reference, not verbatim). **No team section.** Tone respects "no empreendedor mythology."
- **Support hours:** use doc hours everywhere — **Seg–Sex 8h–20h; sábados, domingos e feriados 9h–18h** (replaces current 24/7 claim).
- **Boletos:** stay removed (ignore the doc's contapj boleto re-add; product is TED-only).
- **Emojis:** stripped (FAQ extrato-contábil answer converted to plain text/markup).

---

## 1. About Us — `pages/about.html`
Keep the existing hero ("A voz dos pagamentos") and the partner/ecosystem cards. Replace the middle with **one concise "Quem somos" block** capturing the essentials in LaFinteca voice:

- **Missão** (1 line): simplificar a vida financeira de quem toca um negócio — abrir e gerir uma Conta PJ sem burocracia, sem surpresas.
- **O que fazemos** (1–2 lines): Conta PJ digital regulada pelo Banco Central, com TED, extratos com filtros e agendamentos.
- **Valores** (condensed, 5): Simplicidade · Transparência · Inovação com propósito · Respeito por quem empreende · Evolução constante.
- **Nossa história** (1 line): Fundada em 2024.

No "Conheça a equipe", no "Empresa na Mídia". PT + EN.

## 2. Abrir-conta form — `pages/abrir-conta.html` + `assets/js/site.js`
- Update intro sub to doc copy: *"Preencha o cadastro abaixo e anexe os seus documentos. A nossa equipe entrará em contato para dar sequência a partir daqui."* (PT + EN).
- Replace the single multi-file `#abrir-docs` input with **5 separate labeled file fields**, each its own `.abrir-field--full` box with a clear label:
  1. **Documento de constituição** — Contrato Social / Estatuto / Requerimento
  2. **Cartão CNPJ** — status "Ativo"
  3. **Documento de identificação** — RG ou CNH dos sócios e representantes
  4. **Comprovante de faturamento** — últimos 12 meses
  5. **Comprovante de endereço** — empresa e sócios
- All 5 `required`; keep existing `accept` list; allow `multiple` per box (multiple partners/sócios).
- `site.js`: update validation loop + FormData summary to read the 5 named fields (`doc_constituicao`, `doc_cnpj`, `doc_identificacao`, `doc_faturamento`, `doc_endereco`) instead of one `documentos`.

## 3. Tabela Geral de Tarifas — new `/politicas/tabela-de-tarifas/`
FitBank-style two-panel layout:
- **Left:** LaFinteca logo + legal note ("Os valores das tarifas… em consonância com a Resolução nº 3.919/2010 do Banco Central do Brasil…", "Os valores descritos podem sofrer alterações.") + effective date.
- **Right:** striped `Produto | Valor` table.

Wiring: register in `pages.config.js`; add a card on `pages/politicas.html` (Governança & Conduta or a new "Transparência de Tarifas" group); add footer link; new CSS in the site stylesheet (`.tarifas-*`). PT + EN.

**Draft table (known values; `[NEEDS VALUE]` = pending input):**

| Produto | Valor |
|---|---|
| Abertura de Conta PJ | Gratuita |
| Mensalidade de Conta PJ | Isenta |
| Envio de TED | R$ 5,00 |
| Recebimento de TED | Gratuito |
| Tarifa mensal de Inatividade | Isenta |
| Saldo mínimo | Não há |
| Encerramento de Conta | `[NEEDS VALUE]` |
| Envio de Pix | `[NEEDS VALUE]` |
| Recebimento de Pix | `[NEEDS VALUE]` |
| Saque | `[NEEDS VALUE — ATM ainda indisponível]` |
| Pagamento de Boleto / Tributo | `[NEEDS VALUE — produto tem boleto?]` |

## 4. FAQ sync — `pages/faqs.html`
Reconcile the 42 existing items against the FAQs sheet:
- Apply answer text the sheet marks resolved/DONE.
- Flip "Em validação" badges where the sheet now resolves them (10 currently pending).
- `Como checar o status…` → use **5 dias úteis** (resolved in copy sheet).
- Strip emojis from the extrato-contábil answer.
- Keep the "Em validação" badge on any item still placeholder/blank (see Pending Inputs).
- Add any missing Q&As. PT + EN for changes.

## 5. Site-wide copy + functionality
- **Home** (`home.html`): expand the "começando" block with the doc's fuller copy ("Para quem já tem história para contar e para quem está escrevendo o primeiro capítulo." + subtitle "Aqui você encontra soluções que cabem no tamanho do seu negócio.").
- **Contact** (`contact.html`): Ouvidoria copy → doc rewrite; apply new hours; wire dead WhatsApp + social buttons (Instagram/LinkedIn → same URLs as footer).
- **Footer** (`partials/footer.html`): add Transparência links — Código de Conduta, Prevenção à Fraude, Gestão de Riscos, Riscos de Terceiros, **Tabela de Tarifas**; apply new hours.
- **Código de Conduta** (`politicas/codigo-de-conduta.html`): set intro to *"Fundada em 2024, a LaFinteca tem por objetivo simplificar e otimizar os meios de pagamento com soluções inovadoras, seguras e eficientes…"* (PT + EN).
- **Header redirects** (`partials/nav.html`): "Entrar" → login URL; "Abrir Conta PJ" → `/abrir-conta/` (verify already correct).

## Build & verify
- Run `node build.js` after edits; confirm `dist/` regenerates the new páginas including `/politicas/tabela-de-tarifas/`.
- Smoke-check PT/EN toggle on changed pages and the 5-field form submit (stub).

---

## Pending Inputs (from you — unfilled items ship as flagged placeholders, never fake)
1. **Phone numbers** — real SAC (SP + 0800) and Ouvidoria numbers (currently `(11) 5000-5000` / `0800 500 0000` / `(11) 5000-5001`).
2. **WhatsApp** — link or number for the contact + footer WhatsApp button.
3. **Login URL** — destination for header "Entrar".
4. **Atendimento em Libras** — add it? If yes, to what link/provider? (No Libras element exists on v2 yet.)
5. **Social URLs** — confirm `instagram.com/lafinteca` + `linkedin.com/company/lafinteca` are correct (used to wire contact buttons).
6. **Rate values** — the `[NEEDS VALUE]` rows above (Encerramento, Pix, Saque, Boleto/Tributo, any others).
7. **FAQ placeholders** — final answer for "O que é a LaFinteca?"; status channel for "Como contesto uma transação não reconhecida?"; any other blanks.
8. **Assets (optional)** — home hero image / contapj pricing image / video (left as "Espaço para imagem" placeholders if not provided).
