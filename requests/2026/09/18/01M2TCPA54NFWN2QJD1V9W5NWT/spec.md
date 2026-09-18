# Data Insights & Patterns — Report Generation Instructions (MDES edition)

Instructions for generating the **Data Insights & Patterns** report from a
SICPADetect spreadsheet export, for the **Ministry of Digital Economy and Society
(MDES), Thailand**.

Follow in order: **(1) ingest & validate the input, (2) load the keyword lexicon,
(3) build the "standard" working set, (4) assign subcategory and signal tags,
(5) cluster brands, (6) compute every metric, (7) assemble the report sections,
(8) write the five narrative insights.**

The report is fully data-driven: **never invent a value** — if the input does not
contain it, leave it blank or omit the section.

---

## 0. Jurisdictional premise — read before anything else

Under Thai law, **all online gambling is illegal**. There is no licensing route.
The report therefore **does not distinguish legal from illegal gambling** and must
never use *illegal*, *licensed* or *unlicensed* as a classification axis, label,
chart series, column header or metric name.

| Legacy concept | MDES replacement |
|---|---|
| `Illegal gambling` status | `Gambling` |
| `Licensed gambling` status | `Gambling` (normalised on ingest, §1) |
| `illegal` / `licensed` counts | `gambling` count |
| `illegalShare`, `illegalOfGambling` | `gamblingShare` = gambling / total |
| Illegal ranking + Licensed ranking | one **Gambling ranking** |
| `status: "illegal_gambling"` in the feed | `status: "gambling"` |

The analytical weight that previously sat on the legal/illegal split now sits on
**subcategory** (§4) and **brand clustering** (§5).

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
  `Operator country`, `Jurisdiction`. If present, `Interesting Keywords` and
  `Remarks` are read as additional evidence text in §4.
- **Status normalisation on ingest:**

| Raw value | Normalised to |
|---|---|
| `Illegal gambling` | `Gambling` |
| `Licensed gambling` | `Gambling` |
| `Gambling`, `yes` | `Gambling` |
| `Not gambling`, `no` | `Not gambling` |
| `Unreachable`, `Cannot locate` | `Unreachable` |
| `Review needed` | `Review needed` |
| anything else | `Unknown` |

  Count rows arriving as `Licensed gambling` and state the figure once in a
  footnote — it is a data-quality signal about the upstream classifier, not a
  finding.

**Encoding:** read as UTF-8. The lexicon is predominantly Thai; if Thai characters
arrive mojibaked, stop and report an encoding failure rather than proceeding with a
lexicon that cannot match.

If required columns are missing, stop and report exactly which are missing.

---

## 2. The keyword lexicon

### 2.1 Source

The canonical lexicon is **Appendix A** of this document: 14 categories,
286 distinct keywords, reproduced in full. Use Appendix A as the authority. The
originating workbook `Gambling_Keywords_Full_English_Categories_V1.xlsx` is the
upstream source; where a later version of the workbook exists, regenerate
Appendix A from it rather than matching against the two in parallel.

Load exactly as found. **Do not add, translate or extend keywords.** If a needed
term is missing, report it under `suggestedLexiconAdditions` rather than silently
matching on it.

> **This document is instructions, not report content.** Nothing in §§0–6 or in
> Appendix A is rendered in the report. In particular the report carries no
> lexicon description, no input or status mapping, no column-validation notes and
> no loose ends of any kind — not at the top, not in an appendix, not in a
> footnote. The report opens on the executive summary card and contains only the
> cards listed in §7. Lexicon provenance appears nowhere; the only quality figures
> that surface are `inferredShare` and `generalShare`, on the single methodology
> card at the end.

### 2.2 The two axes

The tabs divide into two groups that are used differently. Keyword counts are
given below; the keywords themselves are in Appendix A.

**Product tabs — candidates for the single `subcategory` field:**

| Tab | Keywords | Role |
|---|---|---|
| `Football Betting` | 21 | Product |
| `Slots` | 32 | Product |
| `Casino` | 15 | Product |
| `Lottery` | 20 | Product |
| `Playing card` | 12 | Product |
| `Baccarat` | 11 | Product |
| `General Gambling` | 22 | **Catch-all — lowest priority (§4.2)** |

**Signal tabs — emitted as `signalTags`, never as a subcategory:**

| Tab | Keywords | What a match indicates |
|---|---|---|
| `Deposit & Withdrawal` | 24 | Payment and cash-out mechanics advertised |
| `Promotions` | 27 | Free-credit and bonus acquisition offers |
| `Marketing & Acquisition` | 25 | Win-rate and payout claims |
| `Affiliate & Agent` | 20 | Affiliate, agent or referral structure |
| `Vague-Evasion Terms` | 20 | Deliberate avoidance of explicit gambling vocabulary |
| `Abbreviations` | 22 | Provider or network branding |
| `Hashtags` | 21 | Promoted through hashtag campaigns |

A site is never assigned to a signal tab as its subcategory. Signal tags are a
multi-valued field: a site can carry any number of them, or none.

### 2.3 Matching rules

| Script | Rule |
|---|---|
| Thai (keyword contains no Latin letters) | Plain case-sensitive substring match against the evidence text. Thai has no word delimiters, so no boundary test is possible or wanted. |
| Latin | Case-insensitive match on a token boundary — `[^a-z0-9]` or string edge on both sides. This stops `BET` matching `betterment` and `WIN` matching `winter`. |
| Hashtag (starts with `#`) | Match the full string including `#` against the evidence text. **Additionally** strip the `#` and re-run the stripped form against the product tabs (§4.3). |

**Short Latin abbreviations require extra care.** `PG`, `PP`, `FC`, `XO`, `SA`,
`WM`, `AG`, `AE` are two-character strings that will false-positive against ordinary
text and against unrelated domains. For these eight, a match counts only when the
token stands alone or sits adjacent to a separator inside a domain stem
(`pg-slot`, `slotxo`, `.../pg/...`). A bare occurrence inside running prose does
not count. Record how many matches each abbreviation produced; if any single
abbreviation accounts for more than 20% of all `Abbreviations` matches, flag it in
the footnote as a probable false-positive source.

### 2.4 Known lexicon collisions

Six keywords appear on more than one tab. Resolve per §4.2 (specific product beats
`General Gambling`). Do not de-duplicate the lexicon itself.

| Keyword | Tabs | Resolution |
|---|---|---|
| `คาสิโน` | General Gambling, Casino | Casino |
| `คาสิโนออนไลน์` | General Gambling, Casino | Casino |
| `พนันกีฬา` | General Gambling, Football Betting | Football Betting |
| `พนันบอล` | General Gambling, Football Betting | Football Betting |
| `แทงบอล` | General Gambling, Football Betting | Football Betting |
| `รูเล็ตออนไลน์` | Casino (listed twice) | Count once |

---

## 3. Build the working set ("standard")

1. Drop every row whose normalised `Status` is **`Review needed`**.
2. **De-duplicate by `URL`**, keeping the first occurrence (rows with no URL are
   kept and keyed by their whole content).
3. The result is the **standard set**; `total = number of rows in it`.

Helper definitions:

- **label(row)** = `Domain` if non-empty, else `URL`.
- **suffix(domain)** = the last dot-segment (`casino.bet` → `.bet`); `(unknown)`
  if the domain has no dot.
- **Source category** = classify `Source` by prefix: `Manual` → `Manual`;
  `Google Search` → `Google Search`; `Variant` → `Variant`; `Redirect` →
  `Redirect`; otherwise `Other`.
- **seed(Source)** = the text inside the first parentheses of `Source`
  (`Variant (bet365.com)` → `bet365.com`), else empty.
- **isGambling** = normalised `Status == 'Gambling'`.
- **evidenceText(row)** = `LLM Reasoning`, `Interesting Keywords`, `Remarks`,
  `URL` and `Domain`, non-empty parts joined with single spaces. Keep original
  case and Thai characters intact; lowercase only a parallel copy used for Latin
  matching.

---

## 4. Subcategory and signal tag assignment

Run over **every row in the standard set**.

### 4.1 Non-gambling rows

If `Status != Gambling` → `subcategory = "Not applicable"`,
`subcategoryMethod = "n/a"`, `signalTags = []`. Stop. Do not force non-gambling
rows into a product bucket, even if a keyword happens to match.

### 4.2 Keyword pass (gambling rows)

| Step | Rule |
|---|---|
| 1 | Match every lexicon keyword against `evidenceText(row)` per §2.3. Keep the tab, keyword and matched location for each hit. |
| 2 | **Signal tags:** for each signal tab with ≥ 1 match, add the tab name to `signalTags`. Store the matched keywords in `signalKeywords`. |
| 3 | **Product score:** for each of the six specific product tabs, score = number of distinct keywords matched from that tab. `General Gambling` is scored separately and is **not** eligible while any specific tab scores > 0. |
| 4 | Exactly one specific tab scores > 0 → assign it. `subcategoryMethod = "keyword"`, `subcategoryConfidence = "high"`. |
| 5 | Several specific tabs score > 0 → assign the highest. Tie-break: (a) more distinct keywords matched; (b) a match in `Domain`/`URL` beats one in reasoning text; (c) longer keyword wins, since `บาคาร่าออนไลน์` is more specific than `คาสิโน`; (d) tab order as listed in §2.2. Record every scoring tab in `subcategoryAlternatives`. Confidence `high` if the top score is at least double the runner-up, else `medium`. |
| 6 | No specific tab scores but `General Gambling` does → `subcategory = "General Gambling"`, `subcategoryMethod = "keyword"`, `subcategoryConfidence = "medium"`. The site is confirmed gambling but the product type is not evidenced. |
| 7 | No product tab scores at all → §4.4. |

A site can score zero on product tabs and still carry several signal tags — a
promo-heavy landing page with no game vocabulary is exactly the
`Vague-Evasion Terms` case. It goes to §4.4 for the product judgement while
keeping its tags.

### 4.3 Hashtag routing

A `Hashtags` match always adds the `Hashtags` signal tag. In addition, strip the
leading `#` and re-run the remainder against the product tabs: `#สล็อต` therefore
also contributes a `Slots` product hit, `#บาคาร่าออนไลน์` a `Baccarat` hit. Hashtags
whose stripped form matches only a signal tab (`#เครดิตฟรี`, `#ฝากถอนออโต้`)
contribute no product score.

### 4.4 Reasoning pass (no product keyword found)

Where the keyword pass yields no product tab, make a judgement from the content of
`LLM Reasoning`: read what the model described the site as offering and place it in
the closest **product tab**. Constraints:

| # | Constraint |
|---|---|
| 1 | Choose only from the seven product tabs in §2.2. Never invent a subcategory and never assign a signal tab as the subcategory. |
| 2 | Judge on the described game or product offering, not on branding, layout or tone. |
| 3 | If the reasoning describes several offerings, choose the one it treats as primary and record the rest in `subcategoryAlternatives`. |
| 4 | If the reasoning confirms gambling but names no specific product, assign `General Gambling`. This is the correct answer, not a failure — do not guess at a product. |
| 5 | If the reasoning describes a site that lists or links to other gambling sites rather than operating games, assign `General Gambling` and add the `Affiliate & Agent` signal tag. |
| 6 | If `LLM Reasoning` is empty, assign `"Unspecified"`. Do not infer from the domain name alone. |
| 7 | Set `subcategoryMethod = "inferred"`, `subcategoryConfidence = "low"`. |
| 8 | Write a one-sentence `subcategoryBasis` paraphrasing the phrase in the reasoning that drove the choice, so a reviewer can audit it. |

### 4.5 Fields emitted per row

`subcategory`, `subcategoryMethod` (`keyword` \| `inferred` \| `n/a`),
`subcategoryConfidence` (`high` \| `medium` \| `low`),
`subcategoryMatchedKeywords`, `subcategoryAlternatives`, `subcategoryBasis`,
`signalTags`, `signalKeywords`.

### 4.6 Quality metrics

- `inferredShare` = inferred rows / gambling rows × 100.
- `generalShare` = rows assigned `General Gambling` / gambling rows × 100.
- `keywordsNeverMatched` = lexicon entries with zero hits, listed per tab.

Report all three in the methodology note. **If `inferredShare` > 30% or
`generalShare` > 40%, state plainly that the lexicon has poor coverage of this
dataset and that subcategory figures are indicative only.** A Thai-language lexicon
run against a set of English or transliterated domains will produce exactly this,
and the report should say so rather than present thin figures confidently.

---

## 5. Brand clustering

The centre of this report: collapse many domains onto the operator behind them.

### 5.1 Normalising a name to a stem

| Step | Operation | Example |
|---|---|---|
| 1 | Take `label(row)`, lowercase, strip scheme and path | `https://www.siam855thb5.com/x` → `www.siam855thb5.com` |
| 2 | Strip leading `www.`, `m.`, `mobile.`, `th.`, `app.` | `siam855thb5.com` |
| 3 | Drop the public suffix | `siam855thb5` |
| 4 | Repeatedly strip trailing market/version affixes: `th`, `thai`, `aff`, `affiliate`, `vip`, `official`, `v\d+`, `\d+` | `siam` |
| 5 | Strip separators `-`, `_`, `.` | `siam` |
| 6 | If the result is under 3 characters, revert to the step-3 value | `i828thv1` → `i` → revert |

The result is **stem(row)**.

### 5.2 Forming clusters

| # | Rule |
|---|---|
| 1 | For `Variant` and `Redirect` rows with a non-empty `seed`, the row joins the cluster of `stem(seed)`. Seed linkage always wins — it is asserted by the crawler, not inferred. |
| 2 | Otherwise group rows sharing an identical stem. |
| 3 | **Near-miss merge:** merge two stems when Jaro–Winkler similarity ≥ 0.90 **and** one is a prefix of the other or they differ only in trailing characters (`dafabet` + `dafawining` → `dafa`). Never merge below 0.90. |
| 4 | A cluster's **name** is its shortest member stem. |
| 5 | A stem occurring once and never merged is a **singleton**. |
| 6 | Record per cluster: `name`, `urlCount`, `domains`, `suffixes`, `sources`, `subcategories` (counts), `signalTags` (counts), `seedLinked`, `mergeBasis` (`seed` \| `stem` \| `similarity`), `firstSeen` / `lastSeen`. |
| 7 | `clusters` sorted by `urlCount` desc; `multiUrlClusters` = those with ≥ 2; `singletonCount` = the rest. |

### 5.3 Signal-tag corroboration

Two clusters sharing an unusual signal-keyword fingerprint are plausibly the same
operator even when their names differ. For each pair of multi-URL clusters compute
the Jaccard similarity of their `signalKeywords` sets. Report pairs scoring ≥ 0.60
in a **"Possible operator linkage"** table: `cluster A / cluster B / shared
keywords / Jaccard`.

**Do not merge on this signal.** It is a lead for an analyst, not a clustering
decision — shared promotional vocabulary is common across unrelated operators using
the same affiliate templates. Label the table as indicative.

### 5.4 Cluster metrics

- `distinctClusters`, `multiUrlClusters`, `singletonCount`.
- **Concentration:** share of gambling URLs in the top 5 and top 10 clusters, and
  `clustersToHalf` = clusters needed to cover 50% of gambling URLs.
- **Cross-subcategory clusters:** clusters spanning ≥ 2 product subcategories,
  with the list — these are multi-product operators.
- **TLD rotation:** clusters whose `suffixes` list has ≥ 2 entries, with counts.
- `topCluster` = the largest; `topClusterDomains` = up to 40 member labels.

---

## 6. Metrics to compute

### 6.1 Counts
`total`; `gambling`, `notGambling`, `unreachable`, `unknown`;
`gamblingShare = gambling / total × 100`.

### 6.2 Evaluation period & volume over time
Parse `Updated at` as a date, ignoring unparseable values. `earliest` / `latest` =
min / max (`YYYY-MM-DD`). `days` = `round((latest − earliest)/1 day) + 1`, else `0`.
**URLs analyzed per day:** distinct URLs updated per date, ascending series
`{ date, count }`.

### 6.3 Status distribution
`{ status, count, pct = count/total*100 }`, sorted by count desc.

### 6.4 Subcategory distribution (gambling rows only)
`{ subcategory, count, pct = count/gambling*100, keywordAssigned,
inferredAssigned, distinctClusters }`, sorted desc. Also emit the method split
`{ subcategory, keyword, inferred }` for the confidence chart.

### 6.5 Signal tag distribution (gambling rows only)
`{ tag, count, pct = count/gambling*100 }` for all seven signal tabs, plus
`tagsPerSite` = mean number of tags per gambling row.

### 6.6 Keyword frequency (gambling rows only)
For every lexicon keyword, the number of gambling rows matching it:
`{ keyword, tab, count, pct = count/gambling*100 }`, sorted desc. Keep the **top
25** for the heat map. Also emit `distinctKeywordsMatched` and
`keywordsNeverMatched` per tab.

### 6.7 Top 10 URL suffixes
Group the standard set by `suffix(Domain)`: `{ total, pct = total/all*100,
gambling, pctGambling = gambling/total*100 }`. Top 10 by total.

### 6.8 Redirect and variant structure (gambling rows only)
`variantRows`, `redirectRows`, `directRows` by Source category, each as a
percentage of their sum. Group redirect rows by `seed`, count distinct URLs, keep
the top 10. `topRedirect` = busiest seed; `topRedirectTargets` = up to 40 labels.

### 6.9 Naming-convention insights
From the domain names in the largest clusters, up to three bullets:
1. **Recurring tokens** — count names containing each of `mobile, m., account,
   login, secure, verify, support, app, bet, casino, win, play, th, thai, aff, vip,
   slot, pg` and name the top 3 with counts. Phrase as evidence of a templated
   naming scheme.
2. **TLD switching** — if names span more than one suffix, list the top 4 with
   counts and note the operator rotates top-level domains.
3. **Distinct count** — "`N` distinct domains across `M` brand clusters."
   If there is no evidence: "No evidence found."

### 6.10 Source analysis (standard set)
For each category in fixed order `Manual, Google Search, Variant, Redirect, Other`:
`{ total, gambling, notGambling, pctGambling }`, with that category's `total` as
the denominator.

### 6.11 Regulatory-blocking evidence
Scan `LLM Reasoning` case-insensitively for: `access to this site has been blocked`,
`court order`, `regulatory authority`, `illegal content`,
`not permitted in your country`, `blocked by`, `has been blocked`, `ปิดกั้น`,
`คำสั่งศาล`, `กระทรวงดิจิทัล` — **except** skip gambling rows whose reasoning also
contains `gambling site` (still active). Capture
`{ url, cluster, subcategory, phrase, excerpt }`, excerpt ~160 characters around
the phrase.

> `illegal content` is retained as a trigger because it is a string found in
> third-party block pages, not a classification this report makes.

### 6.12 Ranking
Parse `Rank` numerically. **Gambling ranking** = gambling rows with a numeric rank,
ascending, top 15 → `{ rank, domain=label, cluster, subcategory, source }`. If none
are ranked, output a sample of up to 10 gambling rows with rank shown as `—`.

### 6.13 Blocklist feed
For every gambling row emit `{ url, domain, cluster, subcategory,
subcategoryMethod, subcategoryConfidence, signalTags, source, rank (or null),
date (YYYY-MM-DD from "Updated at", else raw), status: "gambling", legalEntity,
legalEntityCountry }`.

---

## 7. Report structure

**Every block in the report is a card.** There is no loose text on the page: a
figure, chart, table, diagram or narrative line only ever appears inside a card
with a title. Card geometry, spacing and grid behaviour are in §9.4.

Cards render in the order below. A card whose data is unavailable is omitted
entirely — never rendered empty, and never replaced with a placeholder.

### Card 1 — Executive summary
Single full-width card. A two-column table: reporting figures on the left, values
on the right. Rows: URLs analysed; gambling sites and share; not gambling and
unreachable; brand clusters identified and how many hold more than one domain;
`clustersToHalf`; largest cluster and its size; dominant product subcategory and
share; most common signal tag and share; sites already showing blocking
indicators; the keyword-versus-inferred split. Omit any row whose metric is
unavailable rather than estimating it.

### Group A — The numbers
| Card | Content |
|---|---|
| A1 | **Metric cards row** — four small cards side by side: Total URLs analyzed; Gambling sites; Brand clusters identified; Evaluation period (`days`, with `earliest → latest`). |
| A2 | **URLs analyzed per day** — line chart of §6.2. |
| A3 | **Status distribution** — pie chart and a `status / count / pct` table in one card. Fixed colours: Gambling `#c0392b`, Not gambling `#9aa7b4`, Unreachable `#7d3c98`, Unknown `#e67e22`. |
| A4 | **Top 10 URL suffixes** — bar chart and a `suffix / total / % of all / gambling / % gambling` table in one card. |

### Group B — Subcategories
Every subcategory axis in this group draws its seven columns from the product
categories in **Appendix A.1**, in the order listed there. No other value may
appear on a subcategory axis.

| Card | Content |
|---|---|
| B1 | **Gambling sites by product subcategory** — horizontal bar, descending, product palette (§9.2). |
| B2 | **Subcategory share** — donut of the same data. |
| B3 | **Assignment method by subcategory** — stacked bar; `keyword` in the subcategory colour, `inferred` in the same hue at 45% opacity. Caption carries `inferredShare` and `generalShare`. |
| B4 | **Subcategory table** — `subcategory / count / % of gambling / keyword-assigned / inferred / distinct clusters`. |
| B5 | **Signal tags across the estate** — horizontal bar of §6.5, rows drawn from **Appendix A.2**. Caption carries `tagsPerSite`. |
| B6 | **Heat map — Keyword × subcategory** — rows: the top 25 matched keywords from §6.6, each labelled with a coloured strip showing its own Appendix A category so cross-category bleed is visible. Columns: the seven product subcategories. Cell: gambling sites matching that keyword within that subcategory. |
| B7 | **Heat map — Signal tag × subcategory** — rows: the seven signal categories from Appendix A.2. Columns: the seven product subcategories. Cell: site count. Shows which products lean on promotional, payment or evasion language. |

If no lexicon keyword matched at all, cards B6 and B7 are omitted and card B4
carries a single line: "No lexicon keywords matched this sample; every gambling
row was assigned by reasoning inference."

### Group C — Brands and clustering
| Card | Content |
|---|---|
| C1 | **Metric cards row** — Distinct clusters; Clusters with ≥ 2 URLs; Singletons; `clustersToHalf`. |
| C2 | **Top 15 brand clusters by URL count** — bar chart. |
| C3 | **Cluster concentration** — cumulative-share line; clusters ranked on x, cumulative % of gambling URLs on y, reference line at 50%. |
| C4 | **Heat map — Brand cluster × subcategory** — rows: top 20 clusters. Columns: the seven product subcategories from Appendix A.1. Cell: URL count. Multi-product operators appear as horizontal bands. |
| C5 | **Cluster expansion — `topCluster.name`** — node diagram; cluster name at the centre, member domains around it, edges styled by `mergeBasis` (solid = seed, dashed = stem, dotted = similarity). One interpretation line inside the card. |
| C6 | **Clusters spanning multiple subcategories** — table: `cluster / URL count / subcategories / suffixes`. |
| C7 | **Clusters rotating top-level domains** — table: `cluster / suffixes / counts`. |
| C8 | **Possible operator linkage** — table: `cluster A / cluster B / shared keywords / Jaccard`. Card subtitle reads "Indicative — not a clustering decision". |
| C9 | **Naming conventions** — the §6.9 bullets. |
| C10 | **Structure: direct → redirect → variant** — three small metric cards in one row. |
| C11 | **Redirect propagation — `topRedirect`** — node diagram. Rendered only when a top redirect exists. |

### Group D — Ranking
| Card | Content |
|---|---|
| D1 | **Gambling ranking** — table, top 15 by rank, or the §6.12 sample when none are ranked. |

### Group E — Key insights
| Card | Content |
|---|---|
| E1–E5 | The five narrative cards in §8, one card each: title, body, and a single closing take line set apart from the body. |

### Card F — Methodology
Single card, last on the page. Carries only: `inferredShare`, `generalShare` and
the clustering thresholds used. Nothing else — no lexicon provenance, no input
mapping, no column list.

## 8. The five Key Insights (narrative)

Each card has a **title**, a **body** and a one-line **take**. Compute first:
`gamblingShare`; `topClusterShare = topCluster.urlCount / gambling × 100`;
`top10Share`; `enforcement` = §6.11 evidence count.

| # | Card | Body | Take |
|---|---|---|---|
| 1 | **Scale of the analysis** | Total distinct URLs over the evaluation period (`days`, plus `earliest → latest` if known), of which `gambling` gambling, `notGambling` not gambling, `unreachable` unreachable. | The sample is large enough to reason about patterns, not isolated cases. |
| 2 | **What is being offered** | The top three product subcategories with counts and shares; `generalShare` of sites confirmed as gambling without an evidenced product type; `inferredShare`; the number of lexicon keywords that never matched. | Name the dominant product type. If the top subcategory is under 40% of gambling rows, say the estate is spread across product types rather than concentrated. If `generalShare` exceeds 40%, say the lexicon does not yet resolve product type for this sample and name the tabs with the weakest coverage. |
| 3 | **Brand clustering** | `distinctClusters` clusters across `gambling` URLs; `multiUrlClusters` hold more than one domain; `clustersToHalf` clusters cover half the estate; the largest, `topCluster.name`, holds `topCluster.urlCount` domains across `M` subcategories. If every cluster is a singleton, state that no brand-family structure was detected. | If `clustersToHalf ≤ 10`, a small number of operators account for most of the estate and enforcement against clusters is far more efficient than against individual URLs. Otherwise the estate is diffuse and per-URL blocking will have limited leverage. |
| 4 | **How the estate is grown and marketed** | `variantRows` crawler-identified variants, `redirectRows` behind redirect chains, `directRows` reached directly; busiest redirect source `topRedirect` with `topRedirect.count` destinations; `N` clusters rotate across more than one TLD; the two most common signal tags with their shares. | Redirects and TLD rotation keep a stable entry point while the sites behind it are replaced. Where `Promotions` or `Vague-Evasion Terms` dominate, the acquisition route is promotional content rather than search, which changes where enforcement has to look. |
| 5 | **Enforcement position** | `enforcement` pages already show regulatory-blocking indicators (court orders, regulator notices, block pages). If zero: the set appears pre-enforcement and is a candidate for a first pass. | A measurable share is already under enforcement, or: this set is a candidate for a first enforcement pass, prioritised by cluster rather than by URL. |

---

## 9. Output & presentation notes

### 9.1 General
- Percentages to one decimal place.
- Empty states are explicit ("No multi-URL brand clusters were detected in this
  sample."), never fabricated data.
- Never present an inferred assignment as though it were keyword-derived; every
  subcategory figure carries its method split.
- Thai keywords render in their original script throughout — never transliterate or
  translate them in chart labels or tables. Where an axis cannot fit Thai text,
  truncate with an ellipsis and give the full string in the tooltip.
- The methodology footnote states: `lexiconSource`, `lexiconVersion`, keyword count
  per tab, `inferredShare`, `generalShare`, the count of rows normalised from
  `Licensed gambling`, any abbreviation flagged under §2.3, and the clustering
  thresholds used.
- The blocklist feed (§6.13) is the one output consumed by another screen (the
  Blocklist), where an operator can promote a site to `blacklisted`.

### 9.2 Palette
Categorical palette: `#1F3F63, #c0392b, #27ae60, #7d3c98, #9aa7b4, #2f5c8f,
#e67e22`. Assign product subcategory colours in descending count order; there are
exactly seven product tabs, so no cycling is needed. Signal tabs reuse the same
palette at 70% opacity to keep the two axes visually distinct. Colours must stay
readable in light and dark themes.

### 9.3 Heat map rules
- Sequential single-hue scale based on `#1F3F63`, 8% to 100% opacity. Zero cells
  render as page background with a hairline border, never as the palest fill, so
  "no data" is distinct from "low count".
- Cell labels show the integer count where the cell is wide enough; otherwise rely
  on the tooltip.
- Text flips to white above 55% fill opacity.
- Row order: descending row total. Column order: descending column total.
- Cap at 25 rows × 12 columns; overflow collapses into a final `Other` row or
  column with a note giving the number collapsed.
- Every heat map carries a legend showing the count at both scale endpoints.

### 9.4 Card layout

Every block is a card. Nothing renders outside one.

| Property | Value |
|---|---|
| Structure | Title, optional one-line subtitle, body (chart, table, diagram or prose), optional caption. One idea per card. |
| Corner radius | 6 px |
| Border | 1 px hairline, `#C9D2DB` |
| Fill | page background; no tint, so heat-map zero cells stay distinguishable |
| Padding | 10 mm all sides |
| Gap between cards | 6 mm |
| Title | bold, sentence case, never truncated |
| Page break | a card never splits across pages; if it will not fit, it moves whole to the next page |
| Grid | full-width cards span the 160 mm content column; metric-card rows place 3–4 equal cards across that column |
| Empty data | the card is omitted entirely, not rendered empty |
| Nesting | cards never nest; a chart and its table share one card rather than sitting in two |

Metric-card rows are the one exception to one-idea-per-card: three or four single
figures may sit side by side in a row of small cards, each with its own border and
its figure set large above a short label.


---

## Appendix A — Subcategory and keyword reference

Canonical lexicon. 14 categories, 286 distinct keywords. Reference material for
the classifier and for the heat-map axes — **never rendered in the report**.

### A.1 Product subcategories

Exactly one is assigned per gambling row, as `subcategory`. These seven are the
only permitted values, and they are the columns of every subcategory axis and
every heat map in §7. `general_gambling` is a catch-all: assign it only when no
other product category scores.

| Category | `id` | n | Keywords |
|---|---|---|---|
| **Football Betting** | `football_betting` | 21 | พนันบอล · พนันบอลออนไลน์ · แทงบอล · แทงบอลออนไลน์ · พนันฟุตบอล · แทงฟุตบอล · สปอร์ตบุ๊ค · บอลออนไลน์ · ราคาบอล · บอลสเต็ป · บอลเดี่ยว · สเต็ปบอล · แทงบอลชุด · ทีเด็ดบอล · วิเคราะห์บอล · โต๊ะบอล · ล้มโต๊ะบอล · เดิมพันฟุตบอล · เว็บแทงบอล · บอลสเต็ปแม่น · พนันกีฬา |
| **Slots** | `slots` | 32 | สล็อต · สล็อตออนไลน์ · เกมสล็อต · เกมสล็อตออนไลน์ · สล็อตแตกง่าย · สล็อตแตกบ่อย · สล็อตแตกหนัก · สล็อตแตกจริง · สล็อตใหม่ · สล็อตเว็บตรง · สล็อตวอเลท · เล่นสล็อต · สล็อตเครดิตฟรี · สล็อตแตกทุกวัน · สล็อตมาแรง · สล็อตยอดนิยม · สล็อตค่ายดัง · สล็อตไม่ผ่านเอเย่นต์ · สล็อต pg · สล็อต joker · สล็อต jili · สล็อต pragmatic · สล็อต xo · สล็อต auto · สล็อตแตกไว · สล็อตฝากถอนออโต้ · สล็อตฝากไม่มีขั้นต่ำ · สล็อตโบนัสแตกหนัก · สล็อตสายฟรี · สล็อตปั่นง่าย · สล็อต RTP สูง · สล็อตคืนกำไร |
| **Casino** | `casino` | 14 | คาสิโน · คาสิโนออนไลน์ · คาสิโนสด · คาสิโนสดออนไลน์ · เสือมังกร · รูเล็ต · รูเล็ตออนไลน์ · รูเล๊ต · ไฮโล · ไฮโลออนไลน์ · ไฮโลไทย · หมุนวงล้อโบนันซ่ารายวัน · หมุนวงล้อโบนันซ่า · ปั่นแปะ |
| **Lottery** | `lottery` | 20 | หวยออนไลน์ · แทงหวย · ซื้อหวยออนไลน์ · หวยยี่กี · หวยฮานอย · หวยลาว · หวยรัฐบาล · หวยมาเลย์ · หวยจับยี่กี · จับยี่กี VIP · หวยใต้ดิน · หวยออนไลน์จ่ายจริง · เว็บหวย · เว็บแทงหวย · Huay · Huaylan · หวยหุ้น · หวยหุ้นไทย · หวยหุ้นต่างประเทศ · หวยชุด |
| **Playing card** | `playing_card` | 12 | ไพ่ · ไพ่ออนไลน์ · ไพ่ ออนไลน์ · ไพ่ป๊อก · ป๊อกเด้ง · ป๊อกเด้งออนไลน์ · แบล็คแจ็ค · แบล็คแจ็คออนไลน์ · โป๊กเกอร์ · โป๊กเกอร์ออนไลน์ · ตีไก่สองใบ · ตีไก่สามใบ |
| **Baccarat** | `baccarat` | 11 | บาคารา · บาคาร่า · บาคาร่าออนไลน์ · ไพ่บาคาร่า · บาคาร่าสด · โต๊ะบาคาร่า · บาคาร่าทดลอง · บาคาร่าฟรี · บาคาร่าระบบ AI · บาคาร่าขั้นเทพ · สูตรบาคาร่า |
| **General Gambling** | `general_gambling` | 22 | พนัน · การพนัน · พนันออนไลน์ · เว็บพนัน · เว็บเดิมพัน · เดิมพัน · เดิมพันออนไลน์ · คาสิโน · คาสิโนออนไลน์ · บ่อน · บ่อนออนไลน์ · เว็บเกมพนัน · เกมพนัน · เว็บเสี่ยงโชค · เสี่ยงโชค · เว็บเกมเงิน · เล่นเงินจริง · เกมได้เงินจริง · เดิมพันกีฬา · พนันกีฬา · พนันบอล · แทงบอล |

### A.2 Signal tags

Zero or more per gambling row, as `signalTags`. **Never a subcategory** — these
record how a site operates or markets itself, not what it sells. They are the
rows of heat map B7.

| Category | `id` | n | Indicates | Keywords |
|---|---|---|---|---|
| **Deposit & Withdrawal** | `deposit_withdrawal` | 24 | Payment and cash-out mechanics advertised | ฝากถอนออโต้ · ฝากถอนอัตโนมัติ · ฝากถอนเร็ว · ฝากไว · ถอนจริง · ถอนเร็ว · ถอนไม่อั้น · ถอนทุกวัน · ฝากไม่มีขั้นต่ำ · ถอนไม่มีขั้นต่ำ · ฝาก 1 บาท · ฝาก 10 บาท · ฝากเริ่มต้น · ถอนภายใน 1 นาที · ถอนภายใน 30 วินาที · ฝากผ่านวอเลท · Wallet · ทรูวอลเล็ต · วอลเล็ต · พร้อมเพย์ · ระบบออโต้ · ระบบอัตโนมัติ · อัตราการจ่าย · เรทการจ่าย |
| **Promotions** | `promotions` | 27 | Free-credit and bonus acquisition offers | เครดิตฟรี · รับเครดิตฟรี · เครดิตฟรีไม่ต้องฝาก · เครดิตฟรีกดรับเอง · แจกเครดิตฟรี · โบนัสฟรี · โบนัสสมาชิกใหม่ · โบนัสแรกเข้า · โบนัสต้อนรับ · โบนัสแตกหนัก · โบนัส 100% · โปรสมาชิกใหม่ · โปรฝากแรก · โปรถอนจริง · โปรคืนยอดเสีย · คืนยอดเสีย · โบนัสรายวัน · โบนัสรายสัปดาห์ · โบนัสรายเดือน · โบนัสแนะนำเพื่อน · โบนัสชวนเพื่อน · โปรคุ้ม · โปรแรง · โปรเด็ด · โปรพิเศษ · ของแถม · กิจกรรมแจกเครดิต |
| **Marketing & Acquisition** | `marketing_acquisition` | 25 | Win-rate and payout claims | แตกหนัก · แตกจริง · แตกไม่อั้น · แตกทุกวัน · ทำกำไร · กำไรวันละ · รายได้เสริม · รายได้พิเศษ · สร้างรายได้ · ได้เงินจริง · ถอนเงินจริง · รวยจากมือถือ · เล่นง่าย · ได้จริง · จ่ายจริง · จ่ายหนัก · เข้ากลุ่มฟรี · รับยูสฟรี · สมัครฟรี · สมัครรับโบนัส · สมัครสมาชิก · สมัครวันนี้ · ลุ้นรางวัล · สมาชิกใหม่ · รับทุนฟรี |
| **Affiliate & Agent** | `affiliate_agent` | 20 | Affiliate, agent or referral structure | เอเย่นต์ · Agent · Affiliate · ตัวแทน · นายหน้า · ดีลเลอร์ · รับตัวแทน · เปิดยูสเซอร์ · รับคนเล่น · สายงานพนัน · ระบบแนะนำเพื่อน · ค่าคอม · คอมมิชชั่น · รายได้จากการแนะนำ · รับสมัครพาร์ทเนอร์ · Partner · แชร์รายได้ · หารายได้ออนไลน์ · รายได้ไม่จำกัด · ดีลเลอร์สด |
| **Vague-Evasion Terms** | `vague_evasion` | 20 | Deliberate avoidance of explicit gambling vocabulary | เกมทำเงิน · เกมออนไลน์ทำเงิน · เกมเศรษฐีออนไลน์ · ค่ายเกมดัง · เกมโบนัสแตก · เกมทุนน้อย · เกมสร้างรายได้ · เว็บทำเงิน · เว็บรายได้เสริม · เกมปั่นเครดิต · ปั่นทุน · ปั่นกำไร · ปั่นเครดิต · รับทุนเล่น · เล่นรับทรัพย์ · สายปั่น · สายทำกำไร · สายฟรี · ปั่นแตก · เกมแตกง่าย |
| **Abbreviations** | `abbreviations` | 22 | Provider or network branding | PG · PGSOFT · PP · PRAGMATIC · JILI · JDB · FC · SLOTXO · XO · SA · SEXY · WM · AG · AE · M8BET · BET · WIN · VIP · AUTO · RTP · WALLET · TRUEWALLET |
| **Hashtags** | `hashtags` | 21 | Promoted through hashtag campaigns | #สล็อต · #สล็อตแตกง่าย · #สล็อตเว็บตรง · #สล็อตออนไลน์ · #สล็อตแตกหนัก · #เครดิตฟรี · #บาคาร่า · #บาคาร่าออนไลน์ · #คาสิโนออนไลน์ · #พนันบอล · #แทงบอล · #เว็บพนัน · #เว็บตรง · #เว็บตรงไม่ผ่านเอเย่นต์ · #เล่นสล็อต · #แตกง่าย · #แตกหนัก · #ถอนจริง · #ฝากถอนออโต้ · #สล็อตวอเลท · #สล็อตpg |

### A.3 Matching summary

| Keyword type | Rule |
|---|---|
| Thai | Case-sensitive substring. Thai has no word delimiters, so no boundary test applies. |
| Latin | Case-insensitive, token boundary both sides, so `BET` does not match *betterment*. |
| Mixed (`สล็อต pg`) | Substring. |
| Hashtag | Match including `#`, then strip `#` and re-run against product categories, so `#สล็อต` also scores Slots. |
| Two-letter abbreviations | `PG PP FC XO SA WM AG AE` count only when standing alone or at a separator inside a domain stem. High false-positive risk; monitor per §2.3. |

**Cross-category collisions.** `คาสิโน` and `คาสิโนออนไลน์` resolve to Casino.
`พนันกีฬา`, `พนันบอล` and `แทงบอล` resolve to Football Betting. The specific
product category always beats `general_gambling`. `รูเล็ตออนไลน์` is listed twice
under Casino and counts once.
