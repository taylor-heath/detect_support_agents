<!-- ============================================================= -->
<!--  OFFICIAL REPORT SPECIFICATION — DO NOT DISTRIBUTE EXTERNALLY  -->
<!-- ============================================================= -->

# ┌─────────────────────────────────────────────────────────────┐
# │  EVALUATION OF CH ONLINE GAMBLING ENVIRONMENT                │
# └─────────────────────────────────────────────────────────────┘

|  |  |
|---|---|
| **Client** | **Loterie Romande** |
| **Report purpose** | **Evaluation of CH Online Gambling Environment** |
| **Produced by** | **SICPA SA** |
| **Date of emission** | **7 August 2026** |
| **Document type** | Data Insights & Patterns — report specification |
| **Source pipeline** | SICPADetect spreadsheet export |

---

> This document specifies the **Data Insights & Patterns** report as delivered to
> Loterie Romande. It is derived from the base specification
> (`DATA_INSIGHTS_REPORT_INSTRUCTIONS.md`) with the client-specific adjustments set
> out in Part II, Part III and Part IV. Where this document is silent, the base
> specification governs. The report remains fully **data-driven**: never invent a
> value — if the input does not contain it, leave it blank or omit the section.

---

# PART I — LICENSING REGIME (REFERENCE DATA)

Switzerland runs a **closed licensing system** under the Money Gaming Act
(Geldspielgesetz / BGS, in force since 1 January 2019). Two regulators oversee two
separate markets:

- **ESBK** (Eidgenössische Spielbankenkommission / Federal Gaming Board) — online
  casino games
- **Gespa** (Interkantonale Geldspielaufsicht) — lotteries and sports betting

Everything not on these lists is unlicensed; foreign sites are DNS-blocked and
published on regulator blocklists.

> **Verification:** The authoritative, current list of licensed online casinos is
> published by the ESBK at <https://www.esbk.admin.ch/de/online-spielbanken> (note:
> published as an image). To check any site, search the provider name there — if
> it's absent, it's not licensed. Legitimate Swiss operators use a `.ch` domain and
> publish their physical casino address on the site.

## Gespa-supervised — Lotteries & Sports Betting

A two-operator monopoly split by language region. Only two non-casino sports-betting
concessions exist for the entire country.

| Operator | URL | Brands | Region |
|----------|-----|--------|--------|
| Swisslos | <https://www.swisslos.ch> | Swiss Lotto, EuroMillions, **Sporttip** (sports betting), Jass, scratch/online tickets | German-speaking cantons + Ticino |
| Loterie Romande | <https://www.loro.ch> | **JouezSport** (sports betting), PMU (horse racing), EuroMillions, Swiss Loto, LotoExpress, Tribolo, scratch tickets | French-speaking cantons |

## ESBK-licensed — Online Casinos

Each brand is the online arm of a licensed Swiss land-based casino. Land-based
operator shown only where sources agree; blank = varies by source / verify on the
ESBK page.

| Brand | URL | Land-based operator | Notes |
|-------|-----|---------------------|-------|
| jackpots.ch | <https://www.jackpots.ch> | — | Switzerland's first legal online casino |
| mycasino.ch | <https://www.mycasino.ch> | Grand Casino Luzern | Among the largest Swiss online casinos |
| casino777.ch | <https://www.casino777.ch> | — | |
| starvegas.ch | <https://www.starvegas.ch> | — | |
| 7melons.ch | <https://www.7melons.ch> | — | |
| swiss4win.ch | <https://www.swiss4win.ch> | — | |
| pasino.ch | <https://www.pasino.ch> | Partouche group (Casino du Lac) | |
| swisscasinos.ch | <https://online.swisscasinos.ch> | Swiss Casinos | |
| admiral.ch | <https://www.admiral.ch> | Casino Mendrisio (Novomatic) | Entered market 2025 |
| hurrahcasino.ch | <https://www.hurrahcasino.ch> | — | Newer brand — verify on ESBK list |
| goldengrand.ch | <https://www.goldengrand.ch> | — | Newer brand — verify on ESBK list |
| gamrfirst.ch | <https://www.gamrfirst.ch> | — | Newer brand — verify on ESBK list |
| casineo.ch | <https://www.casineo.ch> | — | Newer brand — verify on ESBK list |

> The roster changes as casinos launch or close. The tables above are the
> **reference whitelist** the report uses (a) to classify licensed sites (Part II)
> and (b) to supply the **brand tokens** for variation detection (Part III §3.14).
> They must be reconciled against the official ESBK/Gespa pages before each run.

---

# PART II — CATEGORISATION MODEL

For Loterie Romande, a gambling site is resolved into **one of three categories**.
Each category has a **code** (for data categorisation) and a **display label** (for
any rendered surface):

| Code | Display label | Meaning |
|------|---------------|---------|
| `ILLEGAL_GAMBLING` | Illegal Gambling Site | Gambling offer with no Swiss authorisation |
| `ESBK_LICENSED` | Licensed by ESBK | Online casino licensed by the ESBK (Part I list) |
| `GESPA_SUPERVISED` | Supervised by GESPA | Lottery / sports-betting operator supervised by Gespa (Part I list) |

Two further non-gambling statuses are retained from the base spec:

| Code | Display label | Meaning |
|------|---------------|---------|
| `NON_GAMBLING` | Not Gambling | Site is not a gambling offer |
| `UNREACHABLE` | Unreachable | Site could not be reached at evaluation time |

`Review needed` rows are dropped from the working set (see Part III §2) and never
categorised.

## 2.1 How a row is categorised

The input `Status` column drives categorisation; the **Part I whitelist** splits
licensed rows into ESBK vs GESPA:

```
registrable(row) = eTLD+1 of Domain (else of URL), lower-cased
                   e.g. "www.loro.ch/jouezsport" -> "loro.ch"

GESPA_DOMAINS = { swisslos.ch, loro.ch }          # from Part I, incl. brand hosts
ESBK_DOMAINS  = { jackpots.ch, mycasino.ch, casino777.ch, starvegas.ch,
                  7melons.ch, swiss4win.ch, pasino.ch, swisscasinos.ch,
                  admiral.ch, hurrahcasino.ch, goldengrand.ch, gamrfirst.ch,
                  casineo.ch }

category(row):
    if Status == 'Illegal gambling'      -> ILLEGAL_GAMBLING
    elif Status == 'Licensed gambling':
        if registrable(row) in GESPA_DOMAINS -> GESPA_SUPERVISED
        elif registrable(row) in ESBK_DOMAINS -> ESBK_LICENSED
        else                              -> ESBK_LICENSED     # see rule below
    elif Status == 'Not gambling'         -> NON_GAMBLING
    elif Status == 'Unreachable'          -> UNREACHABLE
    else                                  -> UNKNOWN
```

**Default-to-ESBK rule.** Gespa is a closed **two-operator** set (Swisslos, Loterie
Romande). Any row that is licensed but does not match `GESPA_DOMAINS` is therefore an
ESBK casino and is categorised `ESBK_LICENSED`. If a licensed row matches neither
list *and* is not a `.ch` domain, flag it in the run log as `LICENSED_UNMATCHED` for
manual review, but still count it under `ESBK_LICENSED` in totals so no licensed site
is silently dropped.

**Derived flags** (replace the base spec's `isLicensed`):
`isIllegal = category == ILLEGAL_GAMBLING`;
`isEsbk = category == ESBK_LICENSED`;
`isGespa = category == GESPA_SUPERVISED`;
`isGambling = isIllegal or isEsbk or isGespa`.

---

# PART III — REPORT GENERATION SPECIFICATION

## 1. Input

Unchanged from the base spec. A single **semicolon-delimited (`;`) CSV** with a
header row (a "SICPADetect spreadsheet export"). Trim whitespace from every header;
skip empty lines.

- **Required columns** (validation fails if any is missing): `Domain`, `URL`,
  `Status`, `Source`, `Rank`, `Updated at`, `Confidence`, `LLM Reasoning`,
  `Case Management Status`. If any are missing, **stop and report exactly which**.
- **Optional columns** (used only if present, never inferred): legal entity — first
  non-empty of `Legal entity`, `Legal Entity`, `Legal entity name`, `Entity`,
  `Operator`, `Operator name`; legal-entity country — first non-empty of
  `Legal entity country`, `Legal Entity Country`, `Entity country`,
  `Operator country`, `Jurisdiction`.
- **Recognized `Status` values:** `Licensed gambling`, `Illegal gambling`,
  `Not gambling`, `Unreachable`, `Review needed`. Any other value → `Unknown`.

Each surviving row is assigned a **category** per Part II before metrics are computed.

## 2. Build the working set ("standard")

Unchanged from the base spec:

1. Drop every row whose `Status` is **`Review needed`**.
2. **De-duplicate by `URL`**, keeping the first occurrence (rows with no URL are
   kept and keyed by their whole content).
3. The result is the **standard set**; `total = number of rows in it`. Every metric
   is computed over the standard set unless stated otherwise.

Helper definitions (from the base spec, retained):
`label(row)` = `Domain` if non-empty else `URL`;
`suffix(domain)` = last dot-segment (`casino.bet` → `.bet`; `(unknown)` if no dot);
`Source category` by prefix (`Manual` / `Google Search` / `Variant` / `Redirect` /
`Other`); `seed(Source)` = text inside first parentheses of `Source`;
`brand(row)` = `seed` for Variant/Redirect rows, else `label(row)`.

## 3. Metrics to compute

### 3.1 Counts  *(CHANGED)*
- `total` — size of the standard set.
- `illegal`, `esbkLicensed`, `gespaSupervised`, `notGambling`, `unreachable` —
  counts of each **category** in the standard set.
- `licensed` (= `esbkLicensed + gespaSupervised`) is retained only as an internal
  subtotal for denominators; it is **not** shown as a card (see §4 Section A).

### 3.2 Evaluation period & volume over time  *(unchanged)*
- Parse `Updated at` as a date; ignore unparseable values.
- `earliest` / `latest` = min / max parseable date (`YYYY-MM-DD`).
- `days` = inclusive span = `round((latest − earliest)/1 day) + 1`, else `0`.
- **URLs analyzed per day**: per date, count **distinct URLs**; output an
  ascending-by-date series `{ date, count }`.

### 3.3 Category distribution  *(CHANGED — replaces "Status distribution")*
Count each of the four reported categories — `ILLEGAL_GAMBLING`, `NON_GAMBLING`,
`ESBK_LICENSED`, `GESPA_SUPERVISED` — plus `UNREACHABLE`/`UNKNOWN` where present.
For each: `{ code, label, description, count, pct = count/total*100 }`, sorted by
count desc. Descriptions are the Part II "Meaning" text. Fixed colors:

| Category | Color |
|----------|-------|
| `ILLEGAL_GAMBLING` | `#c0392b` |
| `ESBK_LICENSED` | `#27ae60` |
| `GESPA_SUPERVISED` | `#1F3F63` |
| `NON_GAMBLING` | `#9aa7b4` |
| `UNREACHABLE` | `#7d3c98` |

### 3.4 Top 10 URL suffixes  *(unchanged)*
Group the standard set by `suffix(Domain)`. Per suffix:
`{ total, pct = total/all*100, illegal = count of ILLEGAL_GAMBLING,
pctIllegal = illegal/total*100 }`. Keep the **top 10 by total**.

### 3.5 Brands & variants (illegal only)  *(unchanged)*
Illegal rows whose Source category is `Variant`, grouped by `seed`; count distinct
URLs per seed → `brands = { seed, count }` desc. `distinctBrands` = number of seeds.
`topBrand` = seed with most variants; `topBrandVariants` = up to 40 `label`s.

### 3.6 Redirects (illegal only)  *(unchanged)*
Illegal rows whose Source category is `Redirect`, grouped by `seed`; distinct URLs
per seed; keep top 10. `topRedirect` = busiest seed; `topRedirectTargets` = up to 40
destination `label`s.

### 3.7 Naming-convention insights  *(unchanged)*
For variants and, separately, redirects, up to three bullets:
1. **Recurring keywords** — top 3 (with counts) among `mobile, m., account, login,
   secure, verify, support, app, bet, casino, win, play`; phrase as a *templated
   naming scheme*.
2. **TLD switching** — if names span >1 suffix, list top 4 suffixes (with counts).
3. **Distinct count** — "`N` distinct <variant|redirect> domains identified in
   total." No evidence → single bullet "No evidence found."

### 3.8 Comparison (illegal only)  *(unchanged)*
Split illegal rows into `variants` (Variant), `redirects` (Redirect), and `direct`
(remainder), each as a percentage of their sum.

### 3.9 Source analysis  *(CHANGED)*
For each category in fixed order `Manual, Google Search, Variant, Redirect, Other`:
`{ total, illegal, esbkLicensed, gespaSupervised,
pctIllegal, pctEsbk, pctGespa }` where percentages use
`illegal + esbkLicensed + gespaSupervised` as the denominator.

### 3.10 Regulatory-blocking evidence  *(unchanged)*
Scan `LLM Reasoning` (case-insensitive). A row is **evidence** if the reasoning
contains any of: `access to this site has been blocked`, `court order`,
`regulatory authority`, `illegal content`, `not permitted in your country`,
`blocked by`, `has been blocked` — **except** skip illegal rows whose reasoning also
contains `gambling site`. Capture `{ url, phrase, excerpt }` (~160 chars around the
phrase).

### 3.11 Rankings  *(CHANGED — see §4 Section C)*
Parse `Rank` numerically.
- **Top Ranked Gambling Sites** = all rows where `isGambling` **and** rank is
  numeric, ascending, top 15 → `{ rank, domain=label, category, categoryLabel,
  source }`.
- Retain a separate **ESBK ranking** and **GESPA ranking** feed for the added
  sections in §4 (Part IV): each is its category's ranked rows ascending. If a
  licensed category has no ranked rows, output a sample of up to 10 of its rows with
  rank shown as `—`.

### 3.12 Blocklist feed (illegal URLs)  *(unchanged)*
For every `ILLEGAL_GAMBLING` row emit `{ url, domain, brand, source,
rank (or null), date (YYYY-MM-DD from "Updated at", else raw),
status: "illegal_gambling", legalEntity, legalEntityCountry }`. Legal-entity fields
come only from the optional columns in §1 — blank if absent.

### 3.13 Licensed sites & ranks (ESBK and GESPA)  *(NEW — feeds Part IV)*
For each licensed category (`ESBK_LICENSED`, `GESPA_SUPERVISED`) independently:
- **Sites**: distinct rows of that category → `{ label, registrableDomain, rank
  (or null), source }`, one entry per registrable domain.
- **Ranks**: the sites ordered by ascending numeric rank (`—` last).
- Empty when none found (explicit empty state, never fabricated).

### 3.14 Brand-proximity variations (per licensed site)  *(NEW — feeds Part IV)*
This detects **look-alike / impersonation** URLs that ride on a licensed brand. It is
distinct from the base spec's Source-category `Variant` (§3.5): a variation here is
matched by **brand-name proximity**, regardless of Source. Source-category `Variant`
rows seeded on a licensed brand are naturally included when they match.

Definitions:
```
brandToken(site)  = distinctive brand string of a Part I licensed site, lower-cased,
                    TLD stripped and separators removed
                    e.g. jackpots.ch->"jackpots", mycasino.ch->"mycasino",
                         casino777.ch->"casino777", swisslos.ch->"swisslos",
                         loro.ch->"loro"; brand aliases added from Part I brands
                         (e.g. "sporttip" for Swisslos, "jouezsport" for Loterie
                         Romande).
host(row)         = full host of URL (or Domain), lower-cased.

A row is a VARIATION CANDIDATE for a licensed site S if:
  - brandToken(S) is a substring of host(row) OR of registrable(row), AND
  - registrable(row) != registrable(S)          # exclude the genuine site itself
  - (candidates are drawn from the whole standard set; in practice they are
     ILLEGAL_GAMBLING or UNKNOWN rows — a candidate that is itself licensed is
     dropped, since it is the real operator on another domain.)

Each candidate captures "brand name + other characters or a different suffix",
i.e. the brand token wrapped in extra characters (myswisslos, swisslos-bet,
jackpots24) and/or a swapped TLD (jackpots.io, mycasino.net).
```

Scoring & ordering (per licensed site):
```
similarity(cand, S) = normalized Levenshtein similarity in [0,1] between
                      registrable(cand) and registrable(S)  (1.0 = identical stem)
rankKey(cand)       = numeric Rank if present, else +infinity (unranked sort last)

Order candidates by (rankKey ASC, similarity DESC, host ASC).
Keep the TOP 20 per licensed site.   # "highest in rank and closest to the domain"
```

Outputs:
- `variationsPerSite` = for each licensed site with ≥1 candidate:
  `{ licensedDomain, category, brandToken,
     variations: [ { url, domain, rank (or —), similarity, category, source } ] (≤20) }`.
- `variationCounts` = for each licensed site: `{ licensedDomain, category, count }`
  (count = **all** matched candidates, not just the displayed top 20). Feeds the
  §4 "variations per licensed URL" bar charts.
- Explicit empty state per site / per category when no candidates are found.

## 4. Report structure (render in this order)

### Section A — "The numbers"  *(CHANGED)*
- **Metric cards:** Total URLs analyzed · Illegal gambling (count) · **Licensed by
  ESBK (count)** · **Supervised by GESPA (count)** · Evaluation period (`days`,
  with `earliest → latest`).
  *(The single "Licensed gambling" card from the base spec is removed and replaced
  by the two category cards above; the evaluation period and total-URL cards are
  retained.)*
- **Chart — "URLs analyzed per day":** line chart of the §3.2 series.
- **Chart — "Category distribution":** pie chart + table of
  `label / description / count / pct` for `ILLEGAL_GAMBLING`, `NON_GAMBLING`,
  `ESBK_LICENSED`, `GESPA_SUPERVISED` (plus `UNREACHABLE` if present), using the
  §3.3 colors, **plus a bar graph of their totals**.
- **Chart — "Top 10 URL suffixes":** bar chart + table of
  `suffix / total / % of all / illegal / % illegal`.

### Section B — "The insights"  *(unchanged from base spec)*
- **"Brands and variants (`distinctBrands` distinct brands)":** bar chart of top
  brands by variant count (empty state when none).
- **"Variant naming convention insights":** the §3.7 variant bullets.
- **"Variant proliferation — `topBrand.seed`"** (only if a top brand exists): node
  diagram, seed at center, variant URLs around it; interpretation:
  "`seed` is the most-cloned brand with `N` variant URLs."
- **"Redirects from — top 10":** bar chart (empty state otherwise).
- **"Redirect propagation — `topRedirect.url`"** (only if one exists): node diagram
  source → destinations; interpretation: "`url` redirects to `N` destinations."
- **"Comparison — URLs → redirects → variants":** metric cards for the §3.8 split.

### Section C — "Ranking"  *(CHANGED)*
- **"Top Ranked Gambling Sites"** — table of the §3.11 top-15 across **all** gambling
  categories, columns `rank / domain / category (Illegal · Licensed by ESBK ·
  Supervised by GESPA) / source`. The category column makes clear, for each ranked
  site, whether it is `ESBK_LICENSED`, `GESPA_SUPERVISED`, or `ILLEGAL_GAMBLING`.
  *(This replaces the base spec's separate "Illegal ranking" and "Licensed ranking"
  tables.)*

### Section D — "Key insights"
The five narrative cards in §5.

## 5. The five Key Insights (narrative)

Compute first: `illegalShare = illegal/total*100`;
`illegalOfGambling = illegal/(illegal+esbkLicensed+gespaSupervised)*100`;
`licensedOfGambling = (esbkLicensed+gespaSupervised)/(illegal+esbkLicensed+gespaSupervised)*100`;
`enforcement = evidence count`.

1. **Scale of the analysis** — total distinct URLs over the evaluation period
   (`days`, plus `earliest → latest` if known), of which N illegal, N licensed by
   ESBK and N supervised by GESPA.
   *Take:* the sample is large enough to reason about patterns, not isolated cases.
2. **Status mix (three-way)** *(CHANGED)* — illegal is `illegalShare`% of all URLs
   and `illegalOfGambling`% of gambling sites; the authorised remainder splits into
   **`esbkLicensed` ESBK-licensed casinos** and **`gespaSupervised` GESPA-supervised
   lottery/betting operators** (`licensedOfGambling`% of gambling sites combined).
   Note unreachable and not-gambling counts.
   *Take:* illegal operators are "the majority" if `illegalOfGambling ≥ 50%`, else
   "a substantial minority"; the licensed environment is anchored by the closed
   ESBK/GESPA regime.
3. **Variants and brand abuse** — `distinctBrands` brands cloned via variant
   domains; the most-abused brand `topBrand.seed` spawned `topBrand.count` variants.
   Where variations target an **ESBK** or **GESPA** brand from Part I (see §3.14),
   call that out explicitly (impersonation of an authorised operator) and name the
   licensed brands with the most look-alikes. If no variants: state that variant
   proliferation is not a factor.
   *Take:* a handful of brands drive most proliferation; prioritize enforcement,
   especially clones of authorised (ESBK/GESPA) brands.
4. **Redirects and traffic shaping** — `illegalRedirects` illegal URLs use redirect
   chains; the busiest source `topRedirect.url` points to `topRedirect.count`
   destinations. If none: direct access dominates.
   *Take:* redirects keep a stable entry point while rotating sites behind it.
5. **Enforcement and regulatory relevance** — `enforcement` pages already show
   regulatory-blocking indicators (court orders, regulator notices, block pages).
   If zero: the set appears pre-enforcement and is a candidate for a first pass.
   *Take:* a measurable share is already under enforcement (or: candidate for a
   first enforcement pass).

---

# PART IV — ADDED CLIENT REPORTS

Rendered after Section C, before Section D. All are **conditional**: render only if
the corresponding rows exist; otherwise show the explicit empty state and no chart.

### Section C-bis — "GESPA-supervised — sites, variations & ranks"
From §3.13 and §3.14 (`GESPA_SUPERVISED`):
- **Sites table** (§3.13): `domain / brand (Part I) / rank (or —) / source`, ordered
  by ascending rank.
- **Top-20 brand-proximity variations, per site** (§3.14): for each GESPA site with
  candidates, a table of its **top 20** variations —
  `url / domain / rank (or —) / similarity / category / source` — ordered highest in
  rank and closest to the licensed domain. These are look-alikes of Swisslos /
  Loterie Romande brands (e.g. Sporttip, JouezSport, `loro`, `swisslos`).
- **Chart — "Variations per GESPA-supervised URL"** (§3.14 `variationCounts`): bar
  chart, one bar per GESPA licensed URL, height = total matched variations for that
  URL (full count, not just the displayed 20).
- **Empty state:** "No GESPA-supervised sites (or variations thereof) were found in
  this sample."

### Section C-ter — "ESBK-licensed — sites, variations & ranks"
From §3.13 and §3.14 (`ESBK_LICENSED`):
- **Sites table** (§3.13): `domain / land-based operator (Part I, where known) /
  rank (or —) / source`, ordered by ascending rank.
- **Top-20 brand-proximity variations, per site** (§3.14): for each ESBK site with
  candidates, a table of its **top 20** variations —
  `url / domain / rank (or —) / similarity / category / source` — ordered highest in
  rank and closest to the licensed domain. These are look-alikes of licensed casino
  brands (e.g. `jackpots`, `mycasino`, `casino777`).
- **Chart — "Variations per ESBK-licensed URL"** (§3.14 `variationCounts`): bar
  chart, one bar per ESBK licensed URL, height = total matched variations for that
  URL.
- **Empty state:** "No ESBK-licensed sites (or variations thereof) were found in this
  sample."

> **Combined overview (optional):** a single grouped bar chart may additionally plot
> variation counts across **all** licensed URLs (GESPA + ESBK together), coloured by
> category (`#1F3F63` GESPA, `#27ae60` ESBK), to surface which authorised brands
> attract the most impersonation at a glance.

---

# PART V — OUTPUT & PRESENTATION NOTES

- Percentages are shown to **one decimal place**; similarity scores to **two**.
- **Empty states are explicit** (e.g. "No variant-based brand abuse was detected in
  this sample."), never fabricated data.
- Category **codes** (`ILLEGAL_GAMBLING`, `ESBK_LICENSED`, `GESPA_SUPERVISED`,
  `NON_GAMBLING`) are used for data categorisation; **display labels**
  ("Illegal Gambling Site", "Licensed by ESBK", "Supervised by GESPA",
  "Not Gambling") are used on every rendered surface.
- "Variations" (§3.14, brand-proximity look-alikes) and "variants" (base-spec
  Source-category `Variant`) are **distinct concepts**; keep the terminology
  separate on rendered surfaces to avoid confusion.
- Colors are brand-fixed and must stay readable in light and dark themes; the
  categorical palette is `#1F3F63, #c0392b, #27ae60, #7d3c98, #9aa7b4, #2f5c8f,
  #e67e22`.
- The Part I whitelist must be reconciled against the live ESBK/Gespa pages before
  each run; any `LICENSED_UNMATCHED` flags from Part II §2.1 are listed in the run
  log for manual review.
- The report is self-contained per configuration; the blocklist feed (§3.12)
  remains the one output consumed by the downstream Blocklist screen, where an
  operator can promote an illegal site to `blacklisted`.
- Make the heading section pronounced and professional.

---

*Prepared by SICPA SA for Loterie Romande — "Evaluation of CH Online Gambling
Environment". Emission date 7 August 2026. Regulatory rosters in Part I change over
time; confirm against official ESBK and Gespa sources before relying on this
specification.*
