# Prompt — Which sites should Polla block next?

**Purpose:** take the list of gambling brands Polla has already blocked, plus a Shodan
pivot export, and return the additional domains Polla needs to block to stop those
brands reappearing under new names.

**Producer:** SICPA SA · SICPADetect® · for Polla Chilena de Beneficencia S.A.

---

## Inputs

1. **Blocked list** — two columns: `brand`, `domain`. These are already blocked.
2. **Shodan export** — three columns needed: `investigation` (the seed site Shodan
   pivoted on), `domain` (what it found), `found_by` (how it found it). Ignore the rest.

---

## What to do

**Step 1 — Get the brand tokens.** From the blocked list, take the short string that
identifies each brand in a domain name: `betsson`, `betway`, `coolbet`, `1xbet`,
`bet365`, `betsala`, and so on. Match the longest token first so `bet365` never resolves
to `bet`.

**Step 2 — Drop the infrastructure.** Delete every discovered domain belonging to a CDN,
host, ISP, registrar or analytics vendor: Akamai, Cloudflare, AWS, Contabo, OVH,
`hosted-by-*`, Opta, Perform, Google, and the like. These are shared plumbing, not
gambling sites. Blocking them would break unrelated services.

**Step 3 — Keep two kinds of domain.**

- **Branded** — the domain contains a brand token. This is a variant of that brand.
- **Unbranded mirror** — no brand token, but Shodan found it through `Page title` or
  `Page HTML`, and the name contains gambling vocabulary (`casino`, `apuesta`, `bet`,
  `juega`, `ruleta`, `tragamonedas`, `sorteo`, `loteria`, `poker`, `bono`). The operator
  cloned the site and changed the name.

**Step 4 — Remove what is already blocked.** Compare on the registrable domain, so
`m.betsala11.com` counts as `betsala11.com`.

**Step 5 — Say why each one matches.** One of: numbered mirror, TLD rotation, brand
token plus affix, brand token embedded, cloned page.

**Step 6 — Prioritise for Chile.**

| Priority | Rule |
|---|---|
| **P1 — Block now** | `.cl`, or the name contains `chile`, `latam`, `lat` |
| **P2 — Block** | Generic suffix reachable from Chile: `.com`, `.net`, `.bet`, `.vip`, `.app`, `.top`, `.online`, `.casino`, `.sbs`, `.xyz` |
| **P3 — Monitor** | Another country's ccTLD (`.ng`, `.kz`, `.in`, `.pl`, `.se`) — not aimed at Chilean players |

**Step 7 — Predict the next domains.** Do not wait for them to appear.

- **Numbered series:** if `brand1001` is blocked and `brand1002` is live, list `1003`,
  `1004`, `1005`.
- **TLD rotation:** if a stem is registered on four suffixes, list the obvious unused
  ones, `.cl` first.
- **Chile affix:** if other brands use `brandchile.com`, `apuestabrand.com` or
  `vip-brandchile.com`, list those forms for brands that have not used them yet.

Mark these as unverified. Check they resolve before submitting them for blocking.

---

## Output

Two tables and nothing else.

**Table 1 — Block list candidates**
`priority | domain | brand | reason | evidence (found_by) | seed site | confidence`
Sorted by priority, then brand.

**Table 2 — Predicted next domains**
`domain | brand | basis`

Then six lines of summary:

1. How many domains Shodan returned, and how many survived filtering.
2. Which brands have the most unblocked variants.
3. Any blocked site whose successor is already live (this is the urgent case).
4. Which Shodan pivot produced the most real variants, so the next sweep uses it first.
5. Which suffixes the variants are moving to.
6. Any gambling cluster found that belongs to no brand on the blocked list.

---

## Rules

- Never list a domain without stating why it matches.
- Never invent a domain in Table 1. Table 2 is the only place predictions go, and they
  are labelled as predictions.
- If a brand has no unblocked variants, say so rather than padding the table.
- Blocking is a legal and telecom process. This output identifies and ranks candidates;
  it does not block anything.