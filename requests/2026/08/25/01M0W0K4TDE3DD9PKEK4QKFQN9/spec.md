# Data Insights & Patterns — Report Generation Instructions

These are the complete instructions for generating the **Data Insights & Patterns**
report from a SICPADetect spreadsheet export. Follow them in order: **(1) ingest &
validate the input, (2) build the "standard" working set, (3) compute every metric,
(4) assemble the report sections, (5) write the five narrative insights.**

The report runs in the context of a configuration (and its country). It is fully
data-driven: never invent a value — if the input does not contain it, leave it blank
or omit the section.

---

## 1. Input

- **Format:** a single **semicolon-delimited (`;`) CSV** with a header row
  (a "SICPADetect spreadsheet export"). Trim whitespace from every header. Skip
  empty lines.
- **Required columns** (validation fails if any is missing; extra columns are
  allowed and ignored unless named below):
  `Domain`, `URL`, `Status`, `Source`, `Rank`, `Updated at`, `Confidence`,
  `LLM Reasoning`, `Case Management Status`.
- **Optional columns** (used only if present, never inferred): legal entity —
  first non-empty of `Legal entity`, `Legal Entity`, `Legal entity name`,
  `Entity`, `Operator`, `Operator name`; legal-entity country — first non-empty of
  `Legal entity country`, `Legal Entity Country`, `Entity country`,
  `Operator country`, `Jurisdiction`.
- **Recognized `Status` values:** `Licensed gambling`, `Illegal gambling`,
  `Not gambling`, `Unreachable`, `Review needed`. Any other value is treated as
  `Unknown`.

If required columns are missing, stop and report exactly which are missing.

---

## 2. Build the working set ("standard")

1. Drop every row whose `Status` is **`Review needed`** (not yet adjudicated).
2. **De-duplicate by `URL`**, keeping the first occurrence (rows with no URL are
   kept and keyed by their whole content).
3. The result is the **standard set**; `total = number of rows in it`. Every metric
   below is computed over the standard set unless stated otherwise.

Helper definitions used throughout:

- **label(row)** = `Domain` if non-empty, else `URL`.
- **suffix(domain)** = the last dot-segment (e.g. `casino.bet` → `.bet`);
  `(unknown)` if the domain has no dot.
- **Source category** = classify `Source` by prefix: starts with `Manual` →
  `Manual`; `Google Search` → `Google Search`; `Variant` → `Variant`;
  `Redirect` → `Redirect`; otherwise `Other`.
- **seed(Source)** = the text inside the first parentheses of `Source`
  (e.g. `Variant (bet365.com)` → `bet365.com`), else empty.
- **brand(row)** = for `Variant`/`Redirect` rows, the `seed` (same operator);
  otherwise `label(row)`.
- **isIllegal** = `Status == 'Illegal gambling'`; **isLicensed** =
  `Status == 'Licensed gambling'`.

---

## 3. Metrics to compute

### 3.1 Counts
- `total` — size of the standard set.
- `illegal`, `licensed`, `notGambling`, `unreachable` — counts of the respective
  `Status` values in the standard set.

### 3.2 Evaluation period & volume over time
- Parse `Updated at` as a date; ignore unparseable values.
- `earliest` / `latest` = min / max parseable date (format `YYYY-MM-DD`).
- `days` = inclusive day span = `round((latest − earliest)/1 day) + 1`, else `0`.
- **URLs analyzed per day**: for each date, count **distinct URLs** updated that
  day; output an ascending-by-date series `{ date, count }`.

### 3.3 Status distribution
- Count each `Status` (mapping unrecognized values to `Unknown`).
- For each: `{ status, count, pct = count/total*100 }`, sorted by count desc.

### 3.4 Top 10 URL suffixes
- Group the standard set by `suffix(Domain)`.
- For each suffix: `{ total, pct = total/all*100, illegal = count of illegal,
  pctIllegal = illegal/total*100 }`. Keep the **top 10 by total**.

### 3.5 Brands & variants (illegal only)
- Take illegal rows whose Source category is `Variant`.
- Group by `seed`; count **distinct URLs** per seed → `brands = { seed, count }`
  sorted desc. `distinctBrands` = number of seeds.
- `topBrand` = the seed with the most variants; `topBrandVariants` = up to 40
  `label`s of its variant rows.

### 3.6 Redirects (illegal only)
- Take illegal rows whose Source category is `Redirect`.
- Group by `seed`; count **distinct URLs** per seed. Keep the **top 10**.
- `topRedirect` = busiest seed; `topRedirectTargets` = up to 40 destination
  `label`s.

### 3.7 Naming-convention insights (for variants and, separately, redirects)
From the set of domain names, produce up to three bullet strings:
1. **Recurring keywords** — count how many names contain each of these tokens and
   name the top 3 (with counts): `mobile, m., account, login, secure, verify,
   support, app, bet, casino, win, play`. Phrase as evidence of a *templated
   naming scheme*.
2. **TLD switching** — if names span more than one suffix, list the suffixes (top
   4 with counts) and note the operator rotates top-level domains.
3. **Distinct count** — "`N` distinct <variant|redirect> domains identified in
   total." If there is no evidence, output a single bullet: "No evidence found."

### 3.8 Comparison (illegal only)
Split the illegal rows into `variants` (Variant), `redirects` (Redirect), and
`direct` (the remainder), with each as a percentage of their sum.

### 3.9 Source analysis (standard set)
For each category in fixed order `Manual, Google Search, Variant, Redirect, Other`:
`{ total, licensed, illegal, pctLicensed, pctIllegal }` where the percentages use
`licensed + illegal` as the denominator.

### 3.10 Regulatory-blocking evidence
Scan `LLM Reasoning` (case-insensitive). A row is **evidence** if the reasoning
contains any of these phrases: `access to this site has been blocked`,
`court order`, `regulatory authority`, `illegal content`,
`not permitted in your country`, `blocked by`, `has been blocked` — **except**
skip illegal rows whose reasoning also contains `gambling site` (still active).
For each match capture `{ url, phrase, excerpt }` where the excerpt is ~160
characters around the phrase.

### 3.11 Rankings
- Parse `Rank` numerically. **Illegal ranking** = illegal rows with a numeric rank,
  ascending, top 15 → `{ rank, domain=label, source }`. **Licensed ranking** = same
  for licensed rows.
- If no licensed rows have a rank, instead output a sample of up to 10 licensed
  rows with rank shown as `—`.

### 3.12 Blocklist feed (illegal URLs)
For every illegal row emit `{ url, domain, brand, source, rank (or null),
date (YYYY-MM-DD from "Updated at", else raw), status: "illegal_gambling",
legalEntity, legalEntityCountry }`. `legalEntity`/`legalEntityCountry` come only
from the optional columns in §1 — blank if absent.

---

## 4. Report structure (render in this order)

### Section A — "The numbers"
- **Metric cards:** Total URLs analyzed; Illegal gambling (count); Licensed
  gambling (count); Evaluation period (days, with `earliest → latest`).
- **Chart — "URLs analyzed per day":** line chart of the §3.2 series.
- **Chart — "Status distribution":** pie chart + a table of `status / count / pct`.
  Use fixed status colors: Licensed `#27ae60`, Illegal `#c0392b`, Not gambling
  `#9aa7b4`, Unreachable `#7d3c98`, Review needed `#e67e22`.
- **Chart — "Top 10 URL suffixes":** bar chart + a table of
  `suffix / total / % of all / illegal / % illegal`.

### Section B — "The insights"
- **"Brands and variants (`distinctBrands` distinct brands)":** bar chart of the
  top brands by variant count (or an empty state when none).
- **"Variant naming convention insights":** the §3.7 variant bullets.
- **"Variant proliferation — `topBrand.seed`"** (only if a top brand exists): a
  node diagram with the seed at the center and its variant URLs around it;
  interpretation line: "`seed` is the most-cloned brand with `N` variant URLs."
- **"Redirects from — top 10":** bar chart (or empty state).
- **"Redirect propagation — `topRedirect.url`"** (only if one exists): node
  diagram of the redirect source → its destinations; interpretation line:
  "`url` redirects to `N` destinations."
- **"Comparison — URLs → redirects → variants":** metric cards for the §3.8 split.

### Section C — "Ranking"
- **Illegal ranking** table (top 15 by rank).
- **Licensed ranking** table, or the licensed sample if none are ranked.

### Section D — "Key insights"
The five narrative cards in §5.

---

## 5. The five Key Insights (narrative)

Each card has a **title**, a **body**, and a one-line **take**. Compute the figures
first: `illegalShare = illegal/total*100`;
`illegalOfGambling = illegal/(licensed+illegal)*100`; `enforcement = evidence count`.

1. **Scale of the analysis** — total distinct URLs over the evaluation period
   (`days`, plus `earliest → latest` if known), of which N illegal and N licensed.
   *Take:* the sample is large enough to reason about patterns, not isolated cases.
2. **Status mix** — illegal is `illegalShare`% of all URLs and `illegalOfGambling`%
   of gambling sites (licensed + illegal); note unreachable and not-gambling counts.
   *Take:* illegal operators are "the majority" if `illegalOfGambling ≥ 50%`, else
   "a substantial minority".
3. **Variants and brand abuse** — `distinctBrands` brands cloned via variant
   domains; the most-abused brand `topBrand.seed` spawned `topBrand.count` variants.
   If no variants: state that variant proliferation is not a factor.
   *Take:* a handful of brands drive most proliferation; prioritize enforcement.
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

## 6. Output & presentation notes

- Percentages are shown to one decimal place.
- Empty states are explicit ("No variant-based brand abuse was detected in this
  sample."), never fabricated data.
- Colors are brand-fixed and must stay readable in light and dark themes; the
  categorical palette is `#1F3F63, #c0392b, #27ae60, #7d3c98, #9aa7b4, #2f5c8f,
  #e67e22`.
- The report is self-contained per configuration; the blocklist feed (§3.12) is
  the one output consumed by another screen (the Blocklist), where an operator can
  promote an illegal site to `blacklisted`.
