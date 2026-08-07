---

# ═══════════════════════════════════════════════════════════════
#  ONLINE GAMBLING ANALYSIS & VAT COMPLIANCE REPORT
# ═══════════════════════════════════════════════════════════════

| | |
|---|---|
| **Prepared for (Client):** | **Polla Chilena de Beneficencia S.A.** |
| **Report purpose:** | **Online Gambling Analysis and VAT Compliance** |
| **Produced by:** | **SICPA SA** |
| **Solution:** | SICPADetect® |
| **Date of emission:** | *{emission_date}* (default: date of generation) |
| **Confidentiality:** | Confidential — for the exclusive use of Polla Chilena de Beneficencia S.A. |

> **This header block must appear, prominently, on the cover / first section of every
> generated report.** It identifies the client, the purpose, the producer, and the date
> of emission. Render it as a pronounced, bordered header band (SICPA primary colour
> `#1F3F63`) with the client name and report purpose as the largest elements.

---

## Overview

These are the complete instructions for generating the **Online Gambling Analysis &
VAT Compliance** report for **Polla Chilena de Beneficencia S.A.**, from a SICPADetect
spreadsheet export. Follow them in order: **(1) ingest & validate the input,
(2) build the "standard" working set, (3) classify every gambling site against the VAT
reference lists, (4) compute every metric, (5) assemble the report sections, (6) write
the narrative insights.**

The report runs in the context of a configuration (Chile). It is fully data-driven:
never invent a value — if the input does not contain it, leave it blank or omit the
section.

### Terminology — important adaptation for this client

This report **does not use the notions of "licensed gambling" or "illegal gambling."**
The only primary distinction is between **gambling** and **non-gambling** sites. Every
site detected as **gambling** is then classified by its **VAT-compliance status** using
the reference lists in §1.3. Wherever the underlying SICPADetect export uses the raw
status `Illegal gambling` (or `Licensed gambling`), those rows are treated simply as
**gambling** rows and re-labelled by VAT status in all outputs.

---

## 1. Input

### 1.1 Format
- A single **semicolon-delimited (`;`) CSV** with a header row (a "SICPADetect
  spreadsheet export"). Trim whitespace from every header. Skip empty lines.

### 1.2 Columns
- **Required columns** (validation fails if any is missing; extra columns are allowed
  and ignored unless named below):
  `Domain`, `URL`, `Status`, `Source`, `Rank`, `Updated at`, `Confidence`,
  `LLM Reasoning`, `Case Management Status`.
- **Optional columns** (used only if present, never inferred): legal entity — first
  non-empty of `Legal entity`, `Legal Entity`, `Legal entity name`, `Entity`,
  `Operator`, `Operator name`; legal-entity country — first non-empty of
  `Legal entity country`, `Legal Entity Country`, `Entity country`,
  `Operator country`, `Jurisdiction`.
- **Recognized `Status` values:** `Licensed gambling`, `Illegal gambling`,
  `Not gambling`, `Unreachable`, `Review needed`. Any other value is treated as
  `Unknown`.
  - **Gambling mapping:** both `Licensed gambling` **and** `Illegal gambling` map to
    the single internal category **`Gambling`**. `Not gambling` maps to
    **`Non-gambling`**. `Unreachable` / `Unknown` are reported as-is and are **not**
    gambling.

If required columns are missing, stop and report exactly which are missing.

### 1.3 VAT reference lists (Chile) — embedded reference data

These lists are the authority for VAT classification. They are reproduced here so the
report is self-contained.

#### A) VAT-registered platforms → classify as **`VAT_PAID`**
Any gambling site whose domain (or, for a variant/redirect, whose seed brand) matches
one of these platforms — **and its variants** — is `VAT_PAID`.

| # | Domain | Legal entity |
|---|--------|--------------|
| 1 | betsala.com | Betsala B.V. |
| 2 | playsala.com | *(shared operator — Betsala)* |
| 3 | latamwin.online | W&C N.V. |
| 4 | winchile.com | *(shared operator — W&C N.V.)* |
| 5 | pokerenchile.com | — |
| 6 | juegaenlineachile.com | Ingus Bridge Corp |
| 7 | bettingiscool.com | — |
| 8 | fortunazo.cl | Leontodo N.V. |
| 9 | jugabet.cl | Gladia N.V. |
| 10 | cl.novibet.com | Logflex MT Limited |
| 11 | skillonnet.com | Skill On Net LTD. |
| 12 | state77.com | Novawave Technology N.V. |
| 13 | cl.bet7k.com | — |
| 14 | 1xbet.com | 1XBET |
| 15 | estelarbet.cl | S3 Tech N.V. |
| 16 | betway.com | Betway Limited |
| 17 | coolbetchile.com | Polar Limited |
| 18 | baytreeinteractive.com | Baytree Interactive Limited |
| 19 | epicbet.com | Overcooked LTD. |
| 20 | respin.com | — |
| 21 | 418services.com | 418SERVICES B.V. |
| 22 | kaizengaming.com | Kaizen Gaming International Limited (Betano) |
| 23 | doradobet.com | VS Services LTD. |
| 24 | betsson1001.com | Netplay Malta Limited |

> Note: `latamwin.online` appears twice in the source list; it is a single platform.

#### B) Brands **not registered** for VAT → classify as **`VAT_NOT_PAID_LISTED`**
Any gambling site whose domain/seed brand contains one of these brand tokens — **and its
variants** — is `VAT_NOT_PAID_LISTED`.

| # | Brand | Match token (lowercase) |
|---|-------|-------------------------|
| 1 | BET365 | `bet365` |
| 2 | STARS | `stars` |
| 3 | 1WIN.COM | `1win` |
| 4 | ELECTRAWORKS | `electraworks` |
| 5 | THELOTTER | `thelotter` |
| 6 | POKERSTARS | `pokerstars` |
| 7 | GGPOKER | `ggpoker` |
| 8 | BETCRIS | `betcris` |
| 9 | LEOVEGAS | `leovegas` |
| 10 | ROOBET | `roobet` |

#### C) Everything else → classify as **`VAT_NOT_PAID`**
Any site detected as **gambling** that is **not** matched by list A or list B is
`VAT_NOT_PAID` (gambling operator with no VAT registration on record and not on the
known-unregistered watchlist).

---

## 2. Build the working set ("standard")

1. Drop every row whose `Status` is **`Review needed`** (not yet adjudicated).
2. **De-duplicate by `URL`**, keeping the first occurrence (rows with no URL are kept
   and keyed by their whole content).
3. The result is the **standard set**; `total = number of rows in it`. Every metric
   below is computed over the standard set unless stated otherwise.

Helper definitions used throughout:

- **label(row)** = `Domain` if non-empty, else `URL`.
- **suffix(domain)** = the last dot-segment (e.g. `casino.bet` → `.bet`); `(unknown)`
  if the domain has no dot.
- **Source category** = classify `Source` by prefix: starts with `Manual` → `Manual`;
  `Google Search` → `Google Search`; `Variant` → `Variant`; `Redirect` → `Redirect`;
  otherwise `Other`.
- **seed(Source)** = the text inside the first parentheses of `Source`
  (e.g. `Variant (bet365.com)` → `bet365.com`), else empty.
- **brand(row)** = for `Variant`/`Redirect` rows, the `seed` (same operator); otherwise
  `label(row)`.
- **isGambling** = `Status ∈ { 'Illegal gambling', 'Licensed gambling' }`.
- **isNonGambling** = `Status == 'Not gambling'`.

### 2.1 Domain normalization (for VAT matching)

Define `norm(host)`:
1. lowercase;
2. strip scheme (`http://`, `https://`);
3. strip a leading `www.`;
4. drop any path, query, or trailing slash — keep the host only.

Define `registrable(host)` = the effective registrable domain (eTLD+1),
e.g. `cl.novibet.com` → `novibet.com`, `m.betsala.com` → `betsala.com`.

### 2.2 VAT classification of each gambling row

Compute `brandKey(row)` = `norm(brand(row))` — i.e. the normalized seed for
variants/redirects, otherwise the normalized domain/label. Then, **in this priority
order**:

1. **`VAT_PAID`** — if `brandKey` matches any list-A platform. A match holds when
   `norm(brandKey)` equals a list-A domain, **or** `registrable(brandKey)` equals the
   `registrable` form of a list-A domain (so subdomains and variants inherit, e.g.
   `m.betway.com` → `betway.com`).
2. **`VAT_NOT_PAID_LISTED`** — else if `brandKey` (or `label(row)`) contains any list-B
   brand token as a substring. Match longer tokens first (`pokerstars` before `stars`)
   to avoid mis-classification.
3. **`VAT_NOT_PAID`** — else (any remaining gambling site).

Non-gambling, unreachable, and unknown rows are **not** assigned a VAT category.

Derived roll-up:
- **`nonVatPaid = VAT_NOT_PAID_LISTED + VAT_NOT_PAID`** — reported as
  **"Non VAT-paid gambling sites."**

---

## 3. Metrics to compute

### 3.1 Counts
- `total` — size of the standard set.
- `gambling`, `nonGambling`, `unreachable` — counts of the respective mapped categories.
- **VAT counts (over gambling rows):** `vatPaid`, `vatNotPaidListed`, `vatNotPaid`.
- `nonVatPaid = vatNotPaidListed + vatNotPaid`.

### 3.2 Evaluation period & volume over time  *(unchanged)*
- Parse `Updated at` as a date; ignore unparseable values.
- `earliest` / `latest` = min / max parseable date (format `YYYY-MM-DD`).
- `days` = inclusive day span = `round((latest − earliest)/1 day) + 1`, else `0`.
- **URLs analyzed per day:** for each date, count **distinct URLs** updated that day;
  output an ascending-by-date series `{ date, count }`.

### 3.3 VAT distribution  *(replaces "Status distribution")*
Over the **gambling** rows, count each VAT category:
`VAT_PAID`, `VAT_NOT_PAID_LISTED`, `VAT_NOT_PAID`.
For each: `{ category, count, pct = count/gambling*100, description }`, sorted by count
desc. Category descriptions to render alongside the graph:

- **`VAT_PAID`** — *Gambling platform registered for VAT in Chile (or a variant of a
  registered platform). Compliant.*
- **`VAT_NOT_PAID_LISTED`** — *Gambling brand on the official watchlist of operators
  known **not** to be registered for VAT (or a variant thereof). Non-compliant, known.*
- **`VAT_NOT_PAID`** — *Gambling operator with no VAT registration on record and not on
  the known-unregistered watchlist. Non-compliant, unlisted.*

### 3.4 Top 10 URL suffixes  *(illegal columns → gambling/non-VAT-paid)*
- Group the standard set by `suffix(Domain)`.
- For each suffix: `{ total, pct = total/all*100, gambling = count of gambling,
  nonVatPaid = count of (VAT_NOT_PAID_LISTED + VAT_NOT_PAID),
  pctNonVatPaid = nonVatPaid/total*100 }`. Keep the **top 10 by total**.

### 3.5 Brands & variants (gambling only)
- Take gambling rows whose Source category is `Variant`.
- Group by `seed`; count **distinct URLs** per seed → `brands = { seed, count, vatStatus }`
  sorted desc, where `vatStatus` is the VAT class of the seed (§2.2). `distinctBrands` =
  number of seeds.
- `topBrand` = the seed with the most variants; `topBrandVariants` = up to 40 `label`s of
  its variant rows.

### 3.6 Redirects (gambling only)
- Take gambling rows whose Source category is `Redirect`.
- Group by `seed`; count **distinct URLs** per seed. Keep the **top 10** (carry
  `vatStatus` of the seed).
- `topRedirect` = busiest seed; `topRedirectTargets` = up to 40 destination `label`s.

### 3.7 Naming-convention insights (for variants and, separately, redirects)  *(unchanged)*
From the set of domain names, produce up to three bullet strings:
1. **Recurring keywords** — count how many names contain each of these tokens and name
   the top 3 (with counts): `mobile, m., account, login, secure, verify, support, app,
   bet, casino, win, play`. Phrase as evidence of a *templated naming scheme*.
2. **TLD switching** — if names span more than one suffix, list the suffixes (top 4 with
   counts) and note the operator rotates top-level domains.
3. **Distinct count** — "`N` distinct <variant|redirect> domains identified in total."
   If there is no evidence, output a single bullet: "No evidence found."

### 3.8 Comparison (gambling only)  *(unchanged split; label without "illegal")*
Split the gambling rows into `variants` (Variant), `redirects` (Redirect), and `direct`
(the remainder), with each as a percentage of their sum.

### 3.9 Source analysis  *(legal/illegal split → VAT split)*
For each category in fixed order `Manual, Google Search, Variant, Redirect, Other`:
`{ total, vatPaid, vatNotPaidListed, vatNotPaid, pctVatPaid, pctVatNotPaidListed,
pctVatNotPaid }` where the percentages use `vatPaid + vatNotPaidListed + vatNotPaid`
(the gambling rows in that category) as the denominator.

### 3.10 Regulatory-blocking evidence  *(scoped to gambling rows)*
Scan `LLM Reasoning` (case-insensitive). A row is **evidence** if the reasoning contains
any of these phrases: `access to this site has been blocked`, `court order`,
`regulatory authority`, `illegal content`, `not permitted in your country`,
`blocked by`, `has been blocked` — **except** skip gambling rows whose reasoning also
contains `gambling site` (still active). For each match capture
`{ url, phrase, excerpt, vatStatus }` where the excerpt is ~160 characters around the
phrase.

### 3.11 Rankings  *(rename; VAT status; licensed ranking removed)*
- Parse `Rank` numerically.
- **Top Ranked Gambling Sites** = gambling rows with a numeric rank, ascending,
  **top 15** → `{ rank, domain = label, source, vatStatus, vatLabel }`.
  - `vatLabel` = "Compliant" for `VAT_PAID` (render **green**, `#27ae60`);
    "Non-compliant" for `VAT_NOT_PAID_LISTED` and `VAT_NOT_PAID`
    (render **red**, `#c0392b`).
- **The "licensed ranking" table is removed.**

### 3.12 Blocklist / VAT feed (gambling URLs)
For every gambling row emit `{ url, domain, brand, source, rank (or null),
date (YYYY-MM-DD from "Updated at", else raw), vatStatus ∈
{VAT_PAID, VAT_NOT_PAID_LISTED, VAT_NOT_PAID}, legalEntity, legalEntityCountry }`.
`legalEntity`/`legalEntityCountry` come only from the optional columns in §1.2 — blank
if absent (fall back to the list-A legal entity when the VAT_PAID match provides one).

### 3.13 Top-100 VAT lists  *(new — see §4 Section D)*
- **`top100VatPaid`** — all gambling rows with `vatStatus == VAT_PAID`, ordered by
  numeric `Rank` ascending (unranked rows last, ordered by `Updated at` desc), **top
  100**. Fields: `{ rank (or —), domain = label, brand, source, date, legalEntity }`.
- **`top100VatNotPaidListed`** — same, for `vatStatus == VAT_NOT_PAID_LISTED`, **top 100**.
- Both lists include **variants** (variant/redirect rows resolve to their seed brand,
  which is what drives their VAT class), so a brand and all its detected variant domains
  appear together.

---

## 4. Report structure (render in this order)

Render the **pronounced header block** (client, purpose, producer, date of emission)
first, then:

### Section A — "The numbers"
- **Metric cards:**
  - Total URLs analyzed *(retained)*;
  - **Evaluation period** (days, with `earliest → latest`) *(retained)*;
  - **VAT-paid gambling sites** (`vatPaid`);
  - **Non VAT-paid gambling sites** (`nonVatPaid = vatNotPaid + vatNotPaidListed`).
  - *(The former "Illegal gambling" and "Licensed gambling" cards are removed.)*
- **Chart — "URLs analyzed per day":** line chart of the §3.2 series.
- **Chart — "VAT distribution":** pie/bar chart of the three VAT categories **plus a
  table** `category / description / count / pct`. Fixed VAT colours:
  `VAT_PAID` `#27ae60` (green), `VAT_NOT_PAID_LISTED` `#e67e22` (amber),
  `VAT_NOT_PAID` `#c0392b` (red).
- **Chart — "Top 10 URL suffixes":** bar chart + a table of
  `suffix / total / % of all / gambling / non-VAT-paid / % non-VAT-paid`.

### Section B — "The insights"
- **"Brands and variants (`distinctBrands` distinct brands)":** bar chart of the top
  brands by variant count (each bar coloured by the brand's VAT status), or an empty
  state when none.
- **"Variant naming convention insights":** the §3.7 variant bullets.
- **"Variant proliferation — `topBrand.seed`"** (only if a top brand exists): a node
  diagram with the seed at the centre and its variant URLs around it; interpretation
  line: "`seed` (`vatStatus`) is the most-cloned brand with `N` variant URLs."
- **"Redirects from — top 10":** bar chart (or empty state).
- **"Redirect propagation — `topRedirect.url`"** (only if one exists): node diagram of
  the redirect source → its destinations; interpretation line: "`url` redirects to `N`
  destinations."
- **"Comparison — URLs → redirects → variants":** metric cards for the §3.8 split.

### Section C — "Top Ranked Gambling Sites"
- **Top Ranked Gambling Sites** table (top 15 by rank) with columns
  `rank / domain / source / VAT status`. Colour the VAT-status cell **green** for
  compliant (`VAT_PAID`) and **red** for non-compliant
  (`VAT_NOT_PAID_LISTED` / `VAT_NOT_PAID`).
- *(No licensed-sites table.)*

### Section D — "VAT compliance registers"  *(new)*
- **"Top 100 — VAT-paid sites and variants":** table from §3.13 `top100VatPaid`
  (`rank / domain / brand / source / date / legal entity`). Header/badge in green.
  Empty state: "No VAT-registered gambling sites were detected in this sample."
- **"Top 100 — Watchlisted non-registered sites and variants (VAT_NOT_PAID_LISTED)":**
  table from §3.13 `top100VatNotPaidListed`. Header/badge in amber/red. Empty state:
  "No watchlisted non-registered gambling sites were detected in this sample."

### Section E — "Key insights"
The narrative cards in §5.

---

## 5. Key Insights (narrative)

Each card has a **title**, a **body**, and a one-line **take**. Compute the figures
first:
`gamblingShare = gambling/total*100`;
`vatPaidShare = vatPaid/gambling*100`;
`nonVatPaidShare = nonVatPaid/gambling*100`;
`enforcement = evidence count`.

1. **Scale of the analysis** — total distinct URLs over the evaluation period (`days`,
   plus `earliest → latest` if known), of which `gambling` are gambling sites and
   `nonGambling` non-gambling.
   *Take:* the sample is large enough to reason about patterns, not isolated cases.

2. **Gambling vs non-gambling mix** — gambling is `gamblingShare`% of all analyzed
   URLs; note the non-gambling and unreachable counts.
   *Take:* gambling activity dominates the monitored space (if `gamblingShare ≥ 50%`),
   else it is a substantial minority of it.

3. **VAT compliance** — of the `gambling` gambling sites, `vatPaid` (`vatPaidShare`%)
   are **VAT-registered (compliant)** and `nonVatPaid` (`nonVatPaidShare`%) are **not
   VAT-paid**, split into `vatNotPaidListed` on the known-unregistered watchlist and
   `vatNotPaid` unlisted.
   *Take:* the majority of detected gambling operators are outside Chile's VAT regime
   (if `nonVatPaidShare ≥ 50%`), representing a measurable tax-compliance gap; else a
   compliant core exists but a meaningful non-compliant tail remains.

4. **Variants and brand abuse** — `distinctBrands` brands cloned via variant domains;
   the most-abused brand `topBrand.seed` (`topBrand.vatStatus`) spawned
   `topBrand.count` variants. If no variants: state that variant proliferation is not a
   factor.
   *Take:* a handful of brands drive most proliferation; cloned VAT-non-compliant brands
   should be prioritized for enforcement and blocking.

5. **Redirects and traffic shaping** — `illegalRedirects`/redirect-using gambling URLs
   use redirect chains; the busiest source `topRedirect.url` points to
   `topRedirect.count` destinations. If none: direct access dominates.
   *Take:* redirects keep a stable entry point while rotating sites behind it,
   complicating both blocking and VAT enforcement.

6. **Enforcement and regulatory relevance** — `enforcement` pages already show
   regulatory-blocking indicators (court orders, regulator notices, block pages). If
   zero: the set appears pre-enforcement and is a candidate for a first pass.
   *Take:* a measurable share is already under enforcement (or: candidate for a first
   enforcement pass), and non-VAT-paid operators are natural first candidates.

---

## 6. Output & presentation notes

- Percentages are shown to one decimal place.
- **VAT colour convention (fixed):** compliant / `VAT_PAID` = green `#27ae60`;
  watchlisted / `VAT_NOT_PAID_LISTED` = amber `#e67e22`; unlisted non-compliant /
  `VAT_NOT_PAID` = red `#c0392b`. In binary "compliant / non-compliant" contexts
  (e.g. the Top Ranked Gambling Sites table), compliant is green and **both**
  non-compliant classes are red.
- Header band uses SICPA primary `#1F3F63`; the categorical palette is
  `#1F3F63, #c0392b, #27ae60, #7d3c98, #9aa7b4, #2f5c8f, #e67e22`. Colours must stay
  readable in light and dark themes.
- Empty states are explicit ("No VAT-registered gambling sites were detected in this
  sample."), never fabricated data.
- The report is self-contained per configuration. The §3.12 gambling/VAT feed is the
  output consumed by the Blocklist screen, where an operator can promote a non-VAT-paid
  site to `blacklisted`.
- The header identification block (**Client**, **Purpose**, **Producer: SICPA SA**,
  **Date of emission**) is mandatory on every emission of this report.

---

*Report specification produced by SICPA SA for Polla Chilena de Beneficencia S.A. —
Online Gambling Analysis & VAT Compliance.*
