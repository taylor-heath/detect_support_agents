# SICPA Detect — Market-Relevance & VAT Compliance Report

A reusable prompt for turning a raw SICPA Detect export into a client-ready PDF report plus
supporting CSVs. Written for Chile / Polla Chilena de Beneficencia, but parameterised so the same
method can be pointed at another market.

---

## PARAMETERS

Set these before running. Everything downstream reads from them.

| Parameter | Default (Chile) |
|---|---|
| `TARGET_MARKET` | Chile |
| `TARGET_LANGUAGE` | Spanish |
| `TARGET_CCTLD` | `.cl` |
| `TARGET_CURRENCY` | CLP |
| `CLIENT` | Polla Chilena de Beneficencia S.A. |
| `NEIGHBOURING_MARKETS` | Mexico, Peru, Argentina, Colombia, Ecuador, Bolivia |

---

## INPUTS

1. **Detection export** — semicolon-delimited CSV. Expected columns: `Domain`, `URL`, `Status`,
   `Source`, `Rank`, `Updated at`, `Confidence`, `LLM Reasoning`, `Case Management Status`.
2. **Blocked-site list** (optional) — one domain per line. Used only to scope which parent brands
   are in play; not used for any legality claim.
3. **VAT reference file** — a `VAT_PAID` section of registered platform URLs (optionally with an
   operator/entity name beside each), and a `VAT_NOT_PAID_LISTED` section of brand names recorded
   as unregistered.

Read every input from disk before writing anything. Do not assume a file is present because it is
mentioned — check, and stop and ask if it is missing.

---

## RULE 1 — TERMINOLOGY: NO LEGALITY FRAMING

**This rule overrides the source data and is not negotiable.**

- The only content distinction permitted is **gambling** vs **non-gambling**.
- Never use: illegal, unlawful, licensed, unlicensed, legal, prohibited, or any synonym, to
  characterise a site or an operator.
- The source dataset labels its `Status` field `Illegal gambling`. Relabel it to `Gambling`
  throughout. **Do not reclassify any record** — counts must reconcile exactly with the source.
- State the relabelling once, in the method section, so a reader reconciling the annex against the
  raw file does not think records were altered.
- Include a terminology note stating that the report makes no assessment of whether any site is
  licensed, unlicensed, lawful or unlawful, and that no such determination should be inferred from
  inclusion.
- Describing the input as a "blocked-site list" is acceptable — that is a factual description of a
  list the client supplied, not a legality claim being made by the report.

---

## RULE 2 — RESOLVE REPLICATION CHAINS

The `Source` field encodes lineage as `Variant (parent.domain)` or `Redirect (parent.domain)`.

- Parse it into a parent map, then resolve each domain **recursively to its root**, guarding
  against cycles.
- Attribute every domain to its **root brand**, not its immediate parent. A seventh-generation
  replica belongs to the originating brand.
- Record `generation` = chain depth. Depth 1 is a direct replica.
- Other `Source` values (`Google Search`, `Youtube`, `Manual`) are discovery methods, not lineage.
  Keep them distinct from variants and redirects and be explicit about which population any figure
  describes.

---

## RULE 3 — MARKET RELEVANCE TEST

A record is `TARGET_MARKET`-relevant only if it carries **gambling** content **and** meets at least
one relevance test.

**Test A — direct market reference**
- `chile` (or target-market string) appears anywhere in the domain, including mid-string
  (`doradobetchile.net`, `micasinocl.com` both qualify — do not require a word boundary)
- domain ends in `TARGET_CCTLD`, or carries a `cl` market marker as a subdomain or suffix
- captured content cites the market, its currency, or its capital

**Test B — target-language content, uncontested**
- the `LLM Reasoning` field quotes `TARGET_LANGUAGE` site text, **and**
- no competing non-target-language market indicator is present

**Spanish vs Portuguese is the hard case and must be handled explicitly.** Discriminate on
vocabulary that differs between the two:

| Spanish | Portuguese |
|---|---|
| apuestas / apostar | apostas / apostar |
| cuenta | conta |
| jugar, juega | jogar, jogue |
| dinero | dinheiro |
| ruleta | roleta |
| tragamonedas | caça-níqueis |
| bienvenida | boas-vindas |
| bonificación | bonificação |
| recibe | recebe |
| giros gratis | rodadas grátis |

**Never treat `depósito` as a Spanish signal** — it is spelled identically in Portuguese and will
produce large-scale false positives. The same caution applies to any other cognate that survives
unchanged across the two languages.

**Test C — exclusion by competing locale.** Detect and exclude on:
- non-Latin scripts by Unicode range: Arabic/Persian, Cyrillic, Chinese, Japanese, Korean, Thai,
  Devanagari, **Bengali**, Hebrew, Vietnamese diacritics
- locale-specific vocabulary: `Willkommensbonus`/`Wetten` (German), `parier`/`plateforme` (French),
  `Deneme Bonusu`/`Yatırım` (Turkish), `Daftar` (Indonesian), `Kirjaudu` (Finnish), `Besøg`
  (Danish), `Cricket ID` (Bangladesh/India), `KBZPay`/`WavePay` (Myanmar)
- currency and country markers: VND, THB, BRL, INR, TRY, DKK, IDR, BDT, NGN

**Market attribution.** Where target-language content points to a *specific* neighbouring market —
Peruvian soles, Argentine pesos, an `.mx` suffix, "para Perú" — record that market rather than
silently treating it as the target. Include such records (they carry the same brands and remain
reachable from the target market) but label them so they can be deprioritised.

**Flag the contradictions.** A domain carrying the target-market brand string while serving a
neighbouring market's content (e.g. `coolbetchile.info` serving Ecuador) is a finding, not noise.

---

## RULE 4 — VAT MAPPING

Map every **gambling** URL to exactly one status. Resolve root-first: walk the chain from root
toward leaf and take the first match.

| Status | Rule |
|---|---|
| `VAT_PAID` | The domain, or any ancestor, matches a platform on the `VAT_PAID` list. Descendants inherit. |
| `VAT_NOT_PAID_LISTED` | The domain, or any ancestor, matches a brand on the `VAT_NOT_PAID_LISTED` list. Descendants inherit. |
| `VAT_NOT_PAID` | Gambling content matching neither list. |

**Matching notes**
- Strip `www.` and common operational subdomains (`cl`, `m`, `mobile`, `login`, `account`,
  `support`, `promo`, `affi`, `offers`) before extracting the brand token.
- Where the reference file annotates a corporate entry with its consumer brand — e.g.
  `kaizengaming.com → Kaizen Gaming (Betano)` — map the **consumer brand token too**, or every
  Betano domain silently falls into `VAT_NOT_PAID`.
- Where a corporate entry carries **no** consumer-brand annotation (`skillonnet.com`,
  `baytreeinteractive.com`, `418services.com`), do not guess the brands behind it. Flag the gap in
  the report and state that any consumer brands they operate will currently default to
  `VAT_NOT_PAID`.

**Two caveats that must appear in the report, prominently:**

1. **Inheritance is an assumption, not a finding.** `VAT_PAID` means the domain *descends from* a
   registered platform — not that the domain itself sits inside that registration. A typosquat
   trading on a registered brand while operating outside its declared estate looks identical in the
   data. This is the group most needing verification, not the group needing least.
2. **`VAT_NOT_PAID` means unlisted, not confirmed unregistered.** An operator may hold a
   registration absent from the supplied lists.

---

## RULE 5 — WHAT TO REPORT HONESTLY

Do not let a clean narrative suppress an inconvenient number.

- **Report the filter's cost.** Say how many records were assessed, how many survived, and why the
  rest did not. If the largest raw clusters drop out entirely, that is the headline, not a footnote.
- **Name false-priority risks.** If ranking by raw volume would direct effort at operators serving
  other markets, say so explicitly.
- **Report the residual.** Where the analysis is scoped to a supplied list, state how much monitored
  activity falls outside that list and is therefore unassessed.
- **Audit the client's own inputs.** Duplicate entries, mixed granularity (bare domains vs paths vs
  subdomains), non-gambling domains on a gambling list, and the same operator appearing on two lists
  encoding contradictory judgements — all belong in the report.
- **Surface parasite hosting.** Legitimate institutional or commercial domains serving gambling
  content indicate compromise or paid placement, not operator-owned property. Separate them.
- **Empty or malformed records** (blank reasoning, URL-encoding artefacts producing duplicates) go
  in a data-quality note rather than being quietly dropped.

---

## OUTPUT 1 — PDF REPORT

Apply the SICPA brand style: navy `#16254C` dominant, accents blue `#0087C8`, magenta `#E3004A`,
green `#77BC1F`, orange `#F38A00`, teal `#6A9F9C`; Arial; dark cover with the three-square motif,
light content pages; no accent stripes or underlines beneath titles.

For VAT categories use semantic colour consistently: `VAT_PAID` green, `VAT_NOT_PAID_LISTED`
orange, `VAT_NOT_PAID` magenta.

**Structure**

1. **Cover** — title, one-sentence framing, client, detection window, issue date, confidentiality.
2. **Executive summary** — headline count in the first sentence; four KPI tiles; three to five
   findings as bullets; one call-out box for the single most consequential implication.
3. **Scope and mapping rules** — funnel chart from all records to the reported set; the three VAT
   categories as labelled cards; how market relevance was determined; the terminology note.
4. **VAT status** — the split, plus a per-source-brand chart coloured by VAT category, with variants
   and redirects distinguished.
5. **Technique** — a worked cluster. Character-level typosquat diffs against the parent domain,
   with differing characters marked, read far better than a node graph.
6. **Market, infrastructure, tempo** — market attribution, TLD spread, weekly detection timeline
   stacked by VAT category.
7. **Limits and data quality** — the caveats from Rules 4 and 5, and observations on the reference
   lists.
8. **Annex A** — the closing table: source brand, type, full URL, market, detection date, grouped by
   VAT category then brand. Every reported URL must appear.
9. **Annex B** (where a filter was applied) — excluded records with grounds, so the judgement can be
   audited rather than assumed.

**Chart rules.** Label every bar with its value. Never rely on colour alone. Keep axis labels in the
report's terminology — a chart axis reading "Not classified as gambling" undoes Rule 1. Verify the
rendered PDF, not the source, for stray terminology.

---

## OUTPUT 2 — CSVs

UTF-8 with BOM. One row per URL. Sort by VAT status, then brand, then domain.

**Columns:** `vat_status`, `vat_operator`, `url`, `domain`, `record_type`, `parent_domain`,
`root_domain`, `generation`, `content_class`, `market`, `market_evidence`, `confidence`, `detected`

Produce:
- **Report set** — exactly the URLs in Annex A.
- **Full mapped set** — every gambling URL with a `market_relevant` Yes/No column, so the mapping
  can be reused beyond this report's scope.

---

## VERIFICATION BEFORE DELIVERY

- [ ] Extract text from the rendered PDF and confirm zero occurrences of illegal / unlawful /
      licensed / unlicensed, other than inside the terminology disclaimer.
- [ ] Count URLs in the annex; confirm it equals the reported figure.
- [ ] Confirm CSV row counts match the report.
- [ ] Confirm gambling / non-gambling totals reconcile with the source file.
- [ ] Spot-check 10 retained and 10 excluded records against their `LLM Reasoning` text by hand.
      Language misclassification is the most likely failure mode.
- [ ] Confirm no table row splits across a page break and no chart label is truncated.
- [ ] Present every deliverable file — a file written but not presented is unreachable.
