# lf-preview V2 — Design Spec

**Date:** 2026-05-28
**Scope:** Apply a batch of content & layout changes to a duplicated copy of `lf-preview` (V1) so V1 stays bit-for-bit untouched.
**Workspace:** `/Users/diegoampuero/lf-preview-v2/` (sibling directory; `git remote` detached so accidental pushes can't reach V1's GitHub repo).

---

## 1. Goals

- Refresh the public marketing surface with two new corporate policies, a fuller-bleed homepage hero, a more honest security story on Conta PJ, and a unified Atendimento section.
- Cut everything the product has decided not to ship right now: video block, Reclame Aqui placeholders, three under-built marketing pages (Eventos/Blog/Carreiras), all BOLETO mentions.
- Keep V1 untouched as a reference / rollback.

## 2. Out of scope

- Choosing the hero image asset (specs provided; image will be dropped into `assets/hero-home.jpg` later).
- Building Pix / boleto product copy back in.
- New GitHub repo / GH Pages deployment for V2 (deferred — V2 ships locally first).

---

## 3. Project duplication (completed at spec time)

```
cp -R /Users/diegoampuero/lf-preview /Users/diegoampuero/lf-preview-v2
cd /Users/diegoampuero/lf-preview-v2 && git remote remove origin
```

- V2 preserves V1's full git history (`0d42ffd` as HEAD).
- `origin` remote removed so V2 cannot accidentally push to `sickdancemoves/lf-preview`.
- V2 builds independently — `build.js` resolves all paths from `__dirname`, no env tweaks needed.

---

## 4. Hero image specs (homepage)

| Property | Value |
|---|---|
| Master file | **2880 × 1400 px** (2× for retina) |
| Format | JPG (photo) or WebP, 70–80% quality, target ≤ 350 KB |
| Display ratio | ~16:7.8 desktop → letterboxed via `object-fit: cover` |
| Safe zone (horizontal) | Keep critical subject inside center 60% — outer 20% on each side crops on mobile |
| Safe zone (vertical) | Middle 70% |
| Buttons safe area | ~520 × 200 px low-contrast region in lower-left third (so headline + buttons stay legible) |
| Mobile overlay | Darkening gradient `linear-gradient(180deg, transparent 30%, rgba(0,0,0,.45) 100%)` baked into CSS |
| Empty space at edges | No hard edges/text/logos within 200 px of left or right edge — they crop on narrow viewports |
| Drop target | `assets/hero-home.jpg` (CSS references it by name — no code change needed when image arrives) |

---

## 5. Content & layout changes

### 5.1 Policy Center — add Cibersegurança, update Segurança da Informação

**Source DOCX (both extracted to memory at spec time):**
- `Politica de Segurança da Informação.docx` (Drive id `1yzH_wfUukaXxVIjutUGMM0OTEfxP5T0o`) — v1.0, May 2026
- `Política de Cibersegurança.docx` (Drive id `1L3MwtwaeNxeXS8jd02Esg7vGE8fO2yeW`) — v1.0, 2026

**Actions:**

1. **Update `pages/politicas/seguranca-da-informacao.html`** — replace existing body with reflowed content from new DOCX. Sections to render:
   - Introdução (Objetivos e Metas, Governança, Manutenção/Atualização/Distribuição)
   - Política (Organização, Gestão de Riscos, RH, Triagem, Treinamento, Processo Disciplinar, Gestão de Ativos, Controle de Acesso, Acesso Remoto, Criptografia, Segurança Física, Segurança Operacional, Comunicações, Aquisição/Desenvolvimento, Terceiros, Incidentes, Continuidade, Conformidade)
   - Aplicação de políticas / Desvio / Revisão
2. **Create `pages/politicas/ciberseguranca.html`** — new page using existing policy template structure. Sections to render:
   - Introdução (Objetivos, Escopo, Governança, Manutenção)
   - Controle contra malware (responsabilidades, novos arquivos, anexos, antivírus corporativo, recursos do scanner, manutenção, escalada, registro, bloqueio, relatórios, boatos)
   - Gerenciamento de dispositivos (autenticação, incidentes, atualização, internet)
   - Registro e monitoramento (auditoria obrigatória, discricionária, aplicação, funcionalidade, proteção, retenção, monitoramento contínuo, alertas, IDS, revisão de logs)
   - Terceiros / Treinamento / Revisão de políticas
3. **Add config entry** in `pages.config.js`:
   ```js
   {
     name: 'politicas/ciberseguranca',
     route: '/politicas/ciberseguranca/',
     title: 'Política de Cibersegurança — LaFinteca',
     description: 'Diretrizes de cibersegurança da LaFinteca — controle contra malware, monitoramento, registro de eventos e gestão de riscos cibernéticos.',
   },
   ```
4. **Link from `pages/politicas.html`** (hub page) — add a tile/row for Cibersegurança next to Segurança da Informação.
5. **Footer link** (`partials/footer.html` Transparência column) — add `<li><a href="/politicas/ciberseguranca/">Política de Cibersegurança / Cybersecurity Policy</a></li>` after the Segurança row.

### 5.2 Remove "Download" button on policy pages

All 9 policy pages currently expose a PDF/download CTA. Strip it from every page. (Implementation will grep for the common pattern — likely `.policy-download` or an anchor with `download` attr — and remove the wrapping container.)

### 5.3 Homepage (`pages/home.html`) — three changes

1. **Hero → full-bleed image-with-overlay-buttons**
   - Replace existing two-column `.hero` (lines 1–17) with a new `.hero--fullbleed` block:
     ```html
     <section class="hero hero--fullbleed">
       <div class="hero__media" aria-hidden="true"></div>  <!-- background-image via CSS -->
       <div class="hero__overlay-content">
         <span class="hero__eyebrow">Conta PJ</span>
         <h1>…current PT/EN bilingual heading…</h1>
         <p class="hero__sub">…current PT/EN sub…</p>
         <div class="hero__buttons">…current 2 buttons…</div>
       </div>
     </section>
     ```
   - CSS: `.hero--fullbleed` is `100vw` wide × `min(85vh, 720px)` tall, `background: url('assets/hero-home.jpg') center/cover`, with darkening gradient overlay baked in. Overlay content sits in lower-left third on desktop, full-width-centered on mobile.
   - Until the JPG is delivered, ship a CSS-only placeholder gradient so the page still renders.
2. **Remove the SIMPLICIDADE video block** — delete lines 51–60 (`<section class="home-block home-block--alt">` containing `home-block__placeholder--xl video-placeholder`).
3. **Remove the Avaliações block** (Reclame Aqui) — delete lines 137–204. Also delete `assets/reclame-aqui-logo.png` and `.reviews*`, `.review-card*` CSS rules.

### 5.4 Conta PJ (`pages/contapj.html`) — five changes

1. **Funcionalidades title reflow** (line 21) — split exactly:
   ```html
   <h2 class="home-block__title fade-in-on-scroll">
     <span data-lang="pt">Tudo o que sua empresa precisa<br>para movimentar dinheiro com clareza.</span>
     <span data-lang="en">Everything your business needs<br>to move money with clarity.</span>
   </h2>
   ```
2. **Drop BOLETO** — surgical removals (the term lives in 5+ places, each treated individually):
   - **Hero sub** (line 9): "TED, **boletos**, extratos com filtros e agendamentos" → "TED, extratos com filtros e agendamentos"
   - **Feature card** (lines 38–44, "Pagamento de boletos") → remove entire `<article>`, drop the card.
   - **Comparison table dash-mock nav** (lives in home.html dash mockup line 93: `<a class="dash-mock__nav-item">Boletos</a>`) → remove that nav row. (Note: this is on Home, but listed here for consolidation.)
   - **Feature card "Agendamentos"** (lines 56–57): "TED e boletos programados — a conta executa no momento certo." → "TEDs programados — a conta executa no momento certo."
   - **Conta PJ FAQ** (line 276): "TED, pagamento de boletos, extratos com filtros…" → "TED, extratos com filtros…"
   - **Conta PJ FAQ** (line 288): "Hoje, a Conta PJ opera com TED e pagamento de boletos." → "Hoje, a Conta PJ opera com TED."
3. **Tailored security section** (lines 185–193) — replace the single-paragraph SECURITY block with a benefit-led grid of 4 cards. New copy (PT + EN):

   **H2:** "Construída sobre fundamentos sólidos." / "Built on solid foundations."

   **Subhead:** "Sua Conta PJ corre sobre infraestrutura regulada e processos de segurança auditados — para que você se preocupe só com o seu negócio." / "Your Conta PJ runs on regulated infrastructure and audited security processes — so you can focus on your business."

   **Card 1 — Regulada pelo Banco Central**
   _PT:_ "Instituição de pagamento autorizada pelo Banco Central do Brasil, na modalidade de Emissora de Moeda Eletrônica. Sua empresa opera dentro das regras do regulador."
   _EN:_ "Payment institution authorized by Brazil's Central Bank as an E-Money Issuer. Your business operates within the regulator's framework."

   **Card 2 — Seus dados protegidos**
   _PT:_ "Criptografia em trânsito e em repouso, autenticação multifator no acesso remoto e armazenamento de senhas em formato unidirecional. Confidencialidade, integridade e disponibilidade tratadas como pilares."
   _EN:_ "Encryption in transit and at rest, multi-factor authentication on remote access, and one-way password storage. Confidentiality, integrity and availability treated as pillars."

   **Card 3 — Monitoramento 24/7**
   _PT:_ "Tráfego de rede, autenticação e sistemas críticos monitorados continuamente. Detecção de intrusões em tempo real e testes de penetração anuais por especialistas terceirizados."
   _EN:_ "Network traffic, authentication and critical systems monitored continuously. Real-time intrusion detection and annual penetration tests by third-party experts."

   **Card 4 — Controle de acessos**
   _PT:_ "Acessos atribuídos por necessidade, revisados periodicamente e registrados para auditoria. Equipes treinadas em segurança e processos formais de resposta a incidentes."
   _EN:_ "Access granted on a need-to-know basis, reviewed periodically and logged for audit. Teams trained in security with formal incident-response processes."

   **Footer line:** keep the existing quote "Simples por fora. Sólido por dentro." / "Simple on the outside. Solid on the inside."

4. **Remove the Avaliações block** (lines 195–262) — same treatment as Home.

### 5.5 Footer (`partials/footer.html`) — three changes

1. **Drop Eventos / Blog / Carreiras** — remove three `<li>` items (lines 32, 33, 34) from the LaFinteca column.
2. **BACEN logo** — replace the inline shield SVG (`.bacen-badge__icon`, lines 18–20) with:
   ```html
   <span class="bacen-badge__icon" aria-hidden="true">
     <img src="assets/bacen-logo.svg" alt="" width="14" height="14">
   </span>
   ```
   Source: official BACEN brand mark (fetched from `bcb.gov.br` press kit). Asset saved at `assets/bacen-logo.svg`. Size & green/white color treatment of the chip stay identical.
3. **Add SAC email** — inside `.contact-block` for SAC (lines 59–66), add a new line after the phone numbers:
   ```html
   <a class="contact-block__email" href="mailto:sac@la-finteca.com.br">sac@la-finteca.com.br</a>
   ```

### 5.6 Delete pages: Eventos / Blog / Carreiras

- Delete files: `pages/events.html`, `pages/blog.html`, `pages/careers.html`.
- Remove entries from `pages.config.js`: `events`, `blog`, `careers` (lines 32–48).
- Remove nav links from `partials/nav.html` (any `data-page="events|blog|careers"`).

### 5.7 Atendimento (`pages/contact.html`) — merged box

Replace the two-card grid (lines 17–55) with a single unified `.support-card` block. Title: **"Fale com a gente"** (user-chosen).

**Structure:**
```
┌────────────────────────────────────────────────┐
│  Fale com a gente                              │
│  24h por dia, 7 dias por semana.               │
│                                                │
│  SAC                                           │
│  (11) 5000-5000     São Paulo e região         │
│  0800 500 0000      Demais localidades         │
│  sac@la-finteca.com.br                         │
│                                                │
│  [📱 Atendimento via WhatsApp]                │
│  Atendimento em Libras ↗                      │
└────────────────────────────────────────────────┘
```

Below the unified box, keep the existing **Redes sociais** column but **prune to Instagram + LinkedIn only** (drop Facebook + YouTube, matching the footer). Keep the **Ouvidoria** column as-is.

---

## 6. CSS / asset cleanup

When ripping out the Avaliações section, also drop:
- `assets/reclame-aqui-logo.png`
- `.reviews`, `.reviews__rating*`, `.reviews-carousel*`, `.review-card*` CSS rules
- Any JS in `assets/js/site.js` keyed on `.js-reviews-carousel`

When ripping out the video placeholder block, also drop:
- `.video-placeholder*` CSS rules

When ripping out the 3 pages, also drop:
- Any nav-specific styling tied to those `data-page` values

---

## 7. Build & verification

After all changes:
```
cd /Users/diegoampuero/lf-preview-v2
node build.js
open dist/index.html
open dist/contapj/index.html
open dist/contact/index.html
open dist/politicas/index.html
open dist/politicas/ciberseguranca/index.html
open dist/politicas/seguranca-da-informacao/index.html
```

**Acceptance checks:**
- Build completes without errors; expected page count drops from 18 to 16 (removed 3 marketing pages, added 1 policy page).
- Home: full-width hero with overlay buttons; no video block; no Avaliações block.
- Conta PJ: H2 reflows to exactly 2 lines; no BOLETO anywhere on page; new 4-card security section; no Avaliações block.
- Footer: no Eventos/Blog/Carreiras; BACEN logo in chip (not the shield); SAC email visible.
- Contact: single merged card; LinkedIn + Instagram only.
- Policies: no Download button on any of the 9 policy pages; new Cibersegurança page reachable from `/politicas/` and footer.

---

## 8. Commit strategy

V2 will commit as a sequence of small, reviewable commits (one per section above), not one mega-commit, so the diff is auditable.

## 9. V1 invariant

At all times during implementation, `git -C /Users/diegoampuero/lf-preview status` must show clean working tree and `git log --oneline -1` must remain `0d42ffd`. Any tooling that touches V1 is a bug.
