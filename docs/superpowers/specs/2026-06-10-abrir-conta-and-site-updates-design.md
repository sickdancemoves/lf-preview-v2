# Abrir Conta page + Conta PJ / Footer / FAQ updates — Design

Date: 2026-06-10
Repo: sickdancemoves/lf-preview-v2 (static site, GitHub Pages, build.js stitches partials)

## Context

The site is a static, bilingual (pt/en) site built by `build.js` from `pages/*.html` +
`partials/` using metadata in `pages.config.js`, deployed to GitHub Pages. There is **no
server**, so a form cannot store data or receive uploads on its own. This spec adds a new
account-opening page plus four smaller edits.

Decisions taken during brainstorming:
- **Storage:** Build the full UI now against a pluggable stub submit function; wire a real
  backend later using documented instructions. No backend code ships in this change.
- **Documents:** Single generic multi-file attach, with the required document list shown as
  helper text.
- **Button routing:** Every "Abrir Conta PJ" button across the site routes to the new page.
- **Social URLs:** Instagram `https://www.instagram.com/lafinteca`,
  LinkedIn `https://www.linkedin.com/company/lafinteca`.

---

## 1. New page — `/abrir-conta/`

### Files
- New `pages/abrir-conta.html` (the page body; build.js wraps it with nav/footer/head).
- New entry in `pages.config.js`:
  ```js
  { name: 'abrir-conta', route: '/abrir-conta/',
    title: 'Abrir Conta PJ — LaFinteca',
    description: 'Abra sua Conta PJ digital na LaFinteca. Preencha o cadastro e envie seus documentos para análise.' }
  ```
- Repoint every "Abrir Conta PJ" button from `/contapj/` to `/abrir-conta/`:
  - `partials/nav.html` (desktop primary button + mobile drawer button)
  - `pages/home.html` (hero CTA + mid-page CTA)
  - `pages/contapj.html` (hero CTA and/or cta-banner)
  - `pages/about.html` and `pages/faqs.html` (any Abrir Conta CTA present)
  - Implementation step must grep `pages/ partials/` for `abrir conta` and update all hits
    that currently target `/contapj/`.

### Form fields (the "Primeiros passos" tab, bilingual labels)

| Field | Type | Required | Notes |
|---|---|---|---|
| CNPJ | text + input mask | yes | format `00.000.000/0000-00` |
| Razão social | text | yes | helper: "Informe a razão social da mesma forma que é exibida no cartão CNPJ" |
| Nome fantasia | text | yes | helper: "Caso não tenha nome fantasia, deverá utilizar a razão social neste campo" |
| E-mail corporativo | email | yes | value is echoed in the success message |
| Celular | tel + mask | yes | format `(00) 00000-0000` |
| Faturamento médio mensal | text | yes | |
| Quando sua empresa foi aberta? | date | no | |
| Ramo de atividade | select | no | Comércio, Serviços, Indústria, Tecnologia, Saúde, Educação, Construção, Alimentação, Outros |
| Categoria da empresa | select | no | MEI, ME, EPP, Empresário Individual, LTDA, S.A., Outros |
| CNAE | text | no | |
| Inscrição Estadual | text | no | disabled + cleared when "Isenta" is checked |
| Inscrição Estadual Isenta | checkbox | no | toggles the field above |
| Documentos | file, `multiple` | yes (≥1 file) | helper lists the 5 required docs (below) |

Required-document helper text (from the FAQ):
Contrato Social / Estatuto / Requerimento; cartão CNPJ (status Ativo); RG ou CNH dos sócios e
representantes; comprovante de faturamento (12 meses); comprovante de endereço da empresa e dos sócios.

Consent line (verbatim spirit of the reference, brand-safe):
"Ao enviar sua solicitação, você autoriza a LaFinteca a coletar seus dados de acordo com a
nossa Política de Privacidade, com o objetivo de comunicar informações sobre o processo de
abertura da sua conta."

Submit button label: **Enviar solicitação** / **Submit request**.

### Submit behavior (stub)
A single JS function `submitAbrirConta(form)` (lives in `assets/js/site.js` or inline in the page):
1. `preventDefault`, run validation (required fields, email format, ≥1 file).
2. Build a `FormData` payload.
3. **Stub action:** log the payload and persist a JSON summary to `localStorage`
   (key `abrir-conta-submissions`) so demo submissions are not lost.
4. Show the success state (below).

A clearly marked block — `// === BACKEND: plug your real endpoint here ===` — wraps the stub
action so the future backend is a single, obvious edit.

### Success state
On success, replace the form with a confirmation panel (no emojis — brand no-go list):
- **PT:** "Que bom que você quer fazer parte da LaFinteca. Vamos analisar a sua solicitação e
  entrar em contato em até 24 horas no e-mail **{email}**."
- **EN:** "We're glad you want to be part of LaFinteca. We'll review your request and contact
  you within 24 hours at **{email}**."

`{email}` is the value entered in "E-mail corporativo".

### Styling
Reuse existing patterns: page wrapped in a `home-block`-style section; inputs styled to match
the existing underline-field aesthetic from the reference image; cards/spacing consistent with
the rest of the site. No new design language introduced.

### Future-backend instructions (written into the page + a short README block)
Document three drop-in options for the stub:
- **Formspree / Web3Forms:** set `<form action>` to the endpoint, keep `multipart/form-data`,
  files post automatically; submissions land in the service dashboard + email.
- **Cloudflare Worker + R2:** POST the FormData to a Worker that writes fields to KV/D1 and
  files to an R2 bucket. (You already run Cloudflare for the IP Intelligence Center.)
- **Google Apps Script + Drive:** POST to an Apps Script web app that appends a Sheet row and
  saves files to a Drive folder.

---

## 2. Conta PJ page (`pages/contapj.html`)

- **Add a 6th feature box** to `.features-grid` (yields a clean 3×2 grid):
  - PT title "Conta PJ gratuita" / body "Nossa Conta PJ é gratuita. Você só paga R$5 por TED."
  - EN title "Free Conta PJ" / body "Our Conta PJ is free. You only pay R$5 per TED."
  - Icon: a price-tag SVG matching the existing `intro-card__icon` stroke style.
- **Remove** the entire Comparação section (`home-block home-block--alt`, the comparison table).
- **Remove** the quote `"Simples por fora. Sólido por dentro."` (`.contapj-quote`) in Segurança.
- **Fix backgrounds:** after removing the `--alt` Comparação block, re-walk the remaining
  section order so no two adjacent `home-block` sections share the same background
  (alternate plain / `--alt` / `--bg` correctly). Verify visually in the built `dist/`.

---

## 3. Footer (`partials/footer.html` + `assets/css/site.css`)

- **BACEN logo white:** apply a CSS filter to `.bacen-badge__logo`
  (`filter: brightness(0) invert(1);`) so the existing SVG is recolored without editing the
  asset (keeps it reusable elsewhere).
- **Social links:** replace the dead `onclick="event.preventDefault();"` anchors with real
  links opening in a new tab:
  - Instagram → `https://www.instagram.com/lafinteca`
  - LinkedIn → `https://www.linkedin.com/company/lafinteca`
  - Add `target="_blank" rel="noopener"` and keep existing `aria-label`s.

---

## 4. FAQs (`pages/faqs.html`)

Add four new Q&As (Dindix → **LaFinteca** renamed), each bilingual (pt/en), filed under the
existing topic tabs:

1. **Existe limite de valor?** → topic `gestao`
   PT: "O limite de valor pode variar de acordo com o perfil do cliente, respeitando o teto de
   R$ 15.000,00. O limite de cada conta será comunicado por meio da plataforma (área logada),
   em consulta de limites."
2. **Quais são as taxas?** → topic `gestao`
   PT: "Cada transferência TED custa R$5,00. A conta de pagamento LaFinteca é gratuita."
3. **Quais são os documentos necessários para abrir uma conta LaFinteca PJ? Onde obtê-los?**
   → topic `abertura` (full document list from the source, Dindix→LaFinteca).
4. **Como checar o status da abertura da minha conta?** → topic `abertura`
   PT: "Depois de completar seu cadastro para a abertura de conta, a nossa equipe avaliará o
   seu pedido e os documentos enviados. Em até 05 dias úteis, você receberá uma atualização
   sobre a aprovação e criação de sua conta, bem como sobre os próximos passos."

**Consistency fix:** existing FAQ "A conta de pagamento LaFinteca PJ tem alguma tarifa?"
currently answers "totalmente gratuita" with no fee. Align it to: account is free, but each
TED costs R$5,00 — so it does not contradict the new fee FAQ and the new Conta PJ pricing box.

EN translations authored for all four new items + the aligned existing item.

---

## Out of scope
- No real backend / persistence (stub only).
- No changes to the onboarding tabs beyond "Primeiros passos" (Validação, Representantes, etc.).
- No new visual design system; everything reuses existing components and tokens.

## Verification
- `node build.js` builds clean; new `/abrir-conta/` appears in `dist/`.
- All Abrir Conta buttons navigate to `/abrir-conta/`.
- Form validates required fields + ≥1 file; success panel shows the entered email.
- Conta PJ: 6 feature boxes, no Comparação, no quote, correct alternating backgrounds.
- Footer: white BACEN logo, working Instagram/LinkedIn links in new tab.
- FAQs: 4 new items render under correct topics, search/filter still works, no "Dindix" text remains.
