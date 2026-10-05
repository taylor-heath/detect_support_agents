# Data Insights & Patterns — Report Generation Instructions (MDES edition)

Instructions for generating the **Data Insights & Patterns** report from a
SICPADetect spreadsheet export, for the **Ministry of Digital Economy and Society
(MDES), Thailand**.

Follow in order: **(1) ingest & validate the input, (2) load the keyword lexicon,
(3) build the "standard" working set, (4) assign subcategory and signal tags,
(5) cluster brands, (6) compute every metric, (7) assemble the report sections,
(8) write the five narrative insights, (9) render the title page and generate the
contents card last, from the cards that actually rendered.**

The report is fully data-driven: **never invent a value** — if the input does not
contain it, leave it blank or omit the section. The one exception is the **Model
Insights** section (§7), which is laid out empty and written by a human afterwards.

Every sentence the generator writes follows the language and terminology rules in
§9.7. Every figure, date, category name and ranking in the report comes from the
dataset or from a run parameter (§1.1). Numbers that appear in this document as
examples are illustrations of format and never render.

> **Revision v5.3.** Reviewer comments applied: run parameters added (§1.1);
> pilot reporting period replaces evaluation period (§6.2, §7); title page
> simplified; executive summary rewritten (Card 1); key figures notes added;
> crawl capacity, daily variation and Unknown status explained (§6.14, C2, C3);
> source labels renamed (§3); rank caption standardised (B1, F1); lexicon match
> explanation rewritten (D2); brand cluster and enforcement wording made
> indicative and constructive (E0, §8); language rules added (§9.7); author
> guidance added to Model Insights.

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

### 1.1 Run parameters

These values describe the system and the engagement, not the dataset. Supply them
on ingest. Define each one once and read it from that single place wherever the
report uses it. Never replace a parameter with a value remembered from an earlier
run.

| Parameter | Meaning | If not supplied |
|---|---|---|
| `pilotStartDate` | First day of the SICPADetect pilot (`YYYY-MM-DD`). Start of the pilot reporting period. | Use `earliest` from §6.2 and add one footnote line stating that the period starts at the first exported record. |
| `crawlCapacityPerDay` | Stated technical crawl capacity of SICPADetect, in sites per 24 hours. | Omit the capacity comparison (§6.14) and every sentence that depends on it. |
| `sourceFeedName` | Name of the feed that supplies `Rank`. | Use the generic rank caption only (B1, F1). |
| `unknownCauses` | Known reasons a URL can stay Unknown, as a short list (for example Cloudflare bot protection). | Name no specific cause in C3. Keep the rest of the Unknown explanation. |
| `reportReference` | `[REF-YYYY-NNN]`. | Omit from the title page. |
| `classification` | Document classification marking. | Omit from the title page. |

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
> cards listed in §7. Two explanatory blocks are the only exceptions, and both are
> defined in §7: the brand cluster explainer (card E0) and the lexicon match
> explanation inside card D2. Beyond those, the lexicon file name and version
> appear only in the footnote line (§9.1). The title page never carries them.

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
- **Source category** = classify `Source` by prefix. The internal key drives
  §5 and §6; the display label is the only form that renders.

  | `Source` prefix | Internal key | Display label |
  |---|---|---|
  | `Manual` | `Manual` | Analyst-enriched |
  | `Google Search` | `Google Search` | Source-feed discovery |
  | `Variant` | `Variant` | Crawler variant |
  | `Redirect` | `Redirect` | Redirect-derived |
  | anything else | `Other` | Other source |

  Apply the mapping by rule, so new source values get a label without editing
  this table. Never render the raw `Source` string, and never render the text
  inside its parentheses (for example the tool name in `Manual (claude.ai)`).
  Every table that shows a source column carries this note beneath it:
  *"Analyst-enriched" means an analyst verified or added details after
  SICPADetect's automated detection. SICPADetect's detection process is
  automated.*
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

Report all three in the footnote line (§9.1). **If `inferredShare` > 30% or
`generalShare` > 40%, state that the lexicon covers part of the vocabulary used in
this dataset and that subcategory figures based on model inference are
indicative.** A Thai-language lexicon run against English or transliterated
domains produces this pattern, and the report says so instead of presenting the
figures with more confidence than the method supports.

---

## 5. Brand clustering

Brand clustering groups related domains so the report can show how many distinct
operations sit behind the identified gambling URLs. Clusters are an analytical
grouping. They are indicative and never a finding about legal ownership.

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

### 6.2 Pilot reporting period & volume over time
Parse `Updated at` as a date, ignoring unparseable values. `earliest` / `latest` =
min / max (`YYYY-MM-DD`).

- `periodStart` = `pilotStartDate` (§1.1), else `earliest`.
- `periodEnd` = `latest`.
- `days` = `round((periodEnd − periodStart)/1 day) + 1`, else `0`.
- `dataDays` = `round((latest − earliest)/1 day) + 1`, the days the export
  covers. Used for the capacity comparison in §6.14.
- `exportStartsLate` = `earliest > periodStart`.

Every rendered date range in the report is `periodStart → periodEnd` and is called
the **pilot reporting period**.

**URLs analysed per day:** distinct URLs updated per date, ascending series
`{ date, count }`, from `earliest` to `latest`. Also compute `dailyMean`,
`dailyMedian`, `dailyMin`, `dailyMax` and `dailyCV` (standard deviation ÷ mean).
`largeDailySwings` = `dailyCV > 0.5`.

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
the denominator. Wherever these figures render, use the display labels from §3.

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

Derived counts, used by Card 1 and insight 5 (§8):

- `blockedCount` = number of standard-set rows with blocking evidence.
- `blockedGambling` = blocked rows whose status is `Gambling`.
- `unblockedGambling` = `gambling − blockedGambling`.
- `blockedPct` = `blockedCount / total × 100`.
- `mostUnblocked` = `unblockedGambling > gambling / 2`.

### 6.12 Ranking
Parse `Rank` numerically. **Gambling ranking** = gambling rows with a numeric rank,
ascending, top 15 → `{ rank, domain=label, cluster, subcategory, source }`, with
`source` as its display label (§3). If none are ranked, output a sample of up to
10 gambling rows with rank shown as `Not ranked`.

### 6.13 Blocklist feed
For every gambling row emit `{ url, domain, cluster, subcategory,
subcategoryMethod, subcategoryConfidence, signalTags, source, rank (or null),
date (YYYY-MM-DD from "Updated at", else raw), status: "gambling", legalEntity,
legalEntityCountry }`.

### 6.14 Crawl capacity and analysed volume
Compute only when `crawlCapacityPerDay` is supplied (§1.1).

- `capacityInPeriod` = `crawlCapacityPerDay × dataDays`.
- `analysedToCapacity` = `total / capacityInPeriod × 100`.
- `capacityGap` = `analysedToCapacity < 50`.

When `capacityGap` is true, the report explains the difference (Card 1, point b).
Technical crawl capacity counts pages SICPADetect can fetch. `total` counts
distinct URLs kept after filtering, deduplication and validation, and excludes
failed crawls, unavailable sites and URLs still in the queue at export.

---

## 7. Report structure

**Every block in the report is a card.** There is no loose text on the page: a
figure, chart, table, diagram or narrative line only ever appears inside a card
with a title. Card geometry, spacing and grid behaviour are in §9.4. The title
page is the one page that carries no card.

Cards render in the order below. A card whose data is unavailable is omitted
entirely — never rendered empty, and never replaced with a placeholder. **The
Model Insights section is the sole exception**: it is written by hand after
generation and therefore renders empty, with its placeholders intact.

**Section headings.** The report is divided into seven sections, rendered in this
order: Model Insights; 10 most prominent gambling sites in Thailand; The numbers;
Subcategories; Brands and clustering; Ranking; Key insights. Each section heading
renders as its name only, exactly as written above. Never prefix a heading with
*Group*, *Section*, a letter or a number, and never refer to a section by letter
anywhere in the report. The card IDs used in this specification (A1, B1, C2, E4
and so on) are internal cross-references for the generator and never render.

### Title page

Full page, alone, with a page break after it. No card border, no grid, no chart.

| Element | Value |
|---|---|
| Crest | Ministry of Digital Economy and Society, top right, matching the crest used on the Site Classification Report. |
| Title | **Data Insights & Patterns**. |
| Subtitle | One line: `Pilot reporting period · {periodStart} to {periodEnd}`, dates as `D Mon YYYY`. No URL count. Omit the line if `periodEnd` is unavailable. |
| Issued to | Ministry of Digital Economy and Society, Thailand. |
| Prepared by | SICPA SA. |
| Report reference | `reportReference` (§1.1); omitted if not supplied. |
| Date of issue | The generation date, `DD/MM/YYYY`. |
| Source system | **SICPADetect**. Nothing else in this field: no lexicon file name, no version. |
| Document classification | `classification` (§1.1). Rendered in the same status fill used elsewhere in the report. |
| Footer | The same footer line as the rest of the report. |

Nothing else appears on this page. No summary figure, no chart, no contents list,
no abstract.

### Card 0 — Contents

Single full-width card, immediately after the title page.

The contents list is **generated from the cards that actually rendered** — never
hand-written and never copied from this specification. Build it as the last step,
after every omit decision in §7 has been made, so a card dropped for missing data
can never appear in it.

| Property | Value |
|---|---|
| Entries | One line per section heading, with its cards indented beneath it. The title page and Card 0 itself are not listed. |
| Label | The card's own rendered title, verbatim. Never re-worded, never truncated. |
| Locator | Page number where the renderer paginates; otherwise an internal link to the card. |
| Omitted cards | Absent. A card omitted under the rule above never appears in the contents. |
| Section with no surviving cards | The section heading is dropped too. |
| Model Insights | Always listed, including its three subheadings, even though it is empty at generation time. |
| Order | Document order, identical to §7. |

### Card 1 — Executive summary

Single full-width card in two parts, stacked, in this order. Both parts sit in the
one card. The part headings are rendered.

**Part 1a. Insights and trends.**

Prose. One short paragraph per point below, 400 words at most. Written last, after
§8, so it condenses the five narrative insights rather than anticipating them. A
reader at MDES who sees only this card should understand the findings without a
verbal briefing. Follow §9.7 throughout.

Cover these points in this order. Drop any point whose metric is unavailable.

| Point | What the paragraph says |
|---|---|
| a. Scale | SICPADetect analysed `total` distinct URLs during the pilot reporting period and classified `gambling` of them (`gamblingShare`%) as gambling. Name the other outcomes present in §6.3, in plain words: not gambling, unreachable, awaiting final classification. Name only the outcomes whose count is above zero. |
| b. Crawl capacity | Only when `capacityGap` is true (§6.14). State that `crawlCapacityPerDay` sites per 24 hours is technical crawl capacity. Explain that the analysed count is lower because SICPADetect filters, deduplicates and validates URLs before they enter the dataset, and because unavailable sites, failed crawls, queued URLs and crawl settings adjusted during the pilot reduce the count. Omit the point when `capacityGap` is false or `crawlCapacityPerDay` is not supplied. |
| c. Products | Name the two largest product subcategories from §6.4 with their shares of gambling rows. If the largest exceeds 50% of gambling rows, say that one category accounts for most of the gambling set. Otherwise say that no single category accounts for a majority. If `inferredShare > 30`, add that subcategory figures based on model inference are indicative. |
| d. Brand clusters | Define a brand cluster in one sentence: a group of domains that appear linked by naming pattern, redirect behaviour, crawler relationship or shared brand stem. Give `distinctClusters`, `multiUrlClusters` and the size of the largest cluster. State that acting on one cluster can cover many related domains, and that the links are indicative and do not establish common ownership. If every cluster is a singleton, say that SICPADetect found no linked groups of domains. |
| e. Domain proliferation | Describe only the patterns present in §5.4 and §6.8: related domains registered under one stem, rotation across top-level domains, redirects between domains. When at least one pattern is present, state that prioritising by cluster covers more of this activity than acting on one URL at a time. Omit the point when none is present. |
| f. Enforcement | The short form of insight 5 in §8, including the branch that applies. |

| Rule | Value |
|---|---|
| Source | Computed metrics and run parameters only. Every statement traces to a figure in §6 or a parameter in §1.1. No fact may appear here that is absent from the rest of the report. |
| Trends | Only where the pilot reporting period supports one. State the direction and the period it covers. Where `days` is too short to carry a trend, say so in one sentence and state nothing further about direction. |
| Figures | At most ten figures in the whole of Part 1a. Part 1b and the cards carry the rest. |
| Prohibited | Forecasts, severity judgements, comparisons to other countries, and any restatement of the Model Insights section. The enforcement statement in point f is the one statement of what MDES can do next; add no other recommendation. |
| Empty | If §8 produced no insight because a metric was unavailable, the paragraph covering it is dropped. Nothing is invented to fill the space. |

**Part 1b. Key figures.**

A two-column table: reporting figures on the left, values on the right. Rows: URLs
analysed; gambling sites and share; not gambling and unreachable; status not yet
resolved (`unknown` and its share of `total`); brand clusters identified and how
many hold more than one domain; `clustersToHalf`; largest cluster and its size;
largest product subcategory and share; most common signal tag and share; URLs
already showing blocking indicators (`blockedCount`); the lexicon match versus
model inference split. Omit any row whose metric is unavailable rather than
estimating it.

Beneath the table, the card carries two notes:

- *URLs analysed* counts distinct URLs kept in the dataset after collection,
  filtering, deduplication and analysis. It does not count raw crawl attempts.
- *Status not yet resolved* counts URLs that SICPADetect collected but had not
  assigned a final classification at the time of export. Give the reason in one
  sentence and the handling steps in one more, using the same wording as the
  Unknown note in C3. If `unknown` exceeds 20% of `total`, add one sentence on why
  the share is high, drawn from `unknownCauses` (§1.1) and from pilot-stage
  processing. Omit this note when `unknown` is zero.

### Model Insights

**Completed manually. Never generated, never pre-filled, never omitted.**

This section is the one place in the report where a human writes free prose. It is
the first section in the report, so the manual reading of the model frames the
generated findings that follow. The generator lays out three empty cards, in this
order, and stops:

| Card | Title | Content |
|---|---|---|
| A1 | **Introduction** | Empty. Placeholder only. |
| A2 | **Insights** | Empty. Placeholder only. |
| A3 | **Performance** | Empty. Placeholder only. |

Rules for this section, which override the general rules where they conflict:

- Do **not** draft, suggest, summarise or pre-populate any of the three cards.
  Do not carry text across from the Key insights narrative cards or from Card 1.
- Do **not** omit a card because it is empty. The §7 omit-if-unavailable rule and
  the §9.1 empty-state rule do not apply here.
- Each card renders at full width with its title and a placeholder body sized to
  hold roughly 150 words, so the layout does not shift when the text is added.
- Placeholder bodies carry no example text, no prompt and no instruction — a
  neutral blank area only.

**Guidance for the author (never rendered).** The generator ignores this block. It
records what reviewers asked the hand-written text to cover, so the person
completing the section can meet it. Follow §9.7 in the prose.

| Card | What the author covers |
|---|---|
| A1 Introduction | State the purpose in plain terms: this section compares model predictions with ground-truth labels. Give the size of the validation subset in domains and state that it is separate from the operational dataset of `total` URLs used in the rest of the report. |
| A3 Performance | Explain confidence scores before any table. List the scores or score ranges present in the validation results. Higher scores usually mean higher model confidence. If any score breaks that pattern, name it and explain what the results show, for example a low score that acts as an uncertainty signal. Head the column **Model confidence score**, never *Confidence*. |

All figures in these cards come from the validation results for the current run.
Do not reuse figures from an earlier version of the report.

### 10 most prominent gambling sites in Thailand

| Card | Content |
|---|---|
| B1 | **10 most prominent gambling sites in Thailand** — single full-width card: a ranked table of the ten highest-ranked gambling sites in the feed that are evidenced as targeting the Thai population. |

**Selection, in this order.** Start from the standard working set (§3), gambling
rows only — the rows whose source status was `Illegal gambling`, normalised to
`Gambling` on ingest per §0. Keep only rows carrying at least one Thai-audience
indicator from the list below **and no Vietnamese-audience indicator**. Rank
ascending on numeric `Rank`; a row with no numeric rank is excluded, never sorted
to the end. Collapse variants and redirects to their registrable domain and keep
the best-ranked row per domain, so one operator cannot fill the table. Take the
first ten.

**Where the evidence must come from.** Both tests below run against the row's
**description text only**: `LLM Reasoning`, `Interesting Keywords` and `Remarks`,
joined as in §3. `URL` and `Domain` are excluded from this test, even though they
form part of `evidenceText(row)` elsewhere. A domain that looks Thai (`th`, `thai`,
`thb`, `siam`, a `.th` suffix, a Thai city in the name) is **never sufficient on its
own**: the description must independently carry a Thai-audience indicator. Brand
names shared across Southeast Asian markets (`fun88`, `jun88`, `99ok`, `lotto`,
`vip` and similar) carry no market signal in either direction.

**Thai-audience indicators.** At least one must be present in the description
text, and the table names which one fired:

| Indicator | Test |
|---|---|
| Thai script | Any character in U+0E00–U+0E7F. |
| Thai currency | `฿`, `THB`, `baht`, `บาท`. |
| Thai payment rails | `พร้อมเพย์` / PromptPay, `ทรูวอลเล็ต` / TrueMoney, or a Thai bank name (Kasikorn / KBank, SCB, Bangkok Bank, Krungthai, Krungsri, TTB, GSB). |
| Thai contact convention | A `+66` number, or a LINE ID or LINE official account. |
| Explicit Thai reference | A positive statement that the site targets or serves Thailand, is written in Thai, or names a Thai city or province, in any script. A negated or comparative mention (`not aimed at Thailand`, `unlike Thai sites`) does not count. |
| Thai-market product terms | An Appendix A keyword **in Thai script**. Latin abbreviations and Latin words from Appendix A (`BET`, `VIP`, `WIN`, `PG`, `JILI`, `Wallet`, `Agent` and so on) are used across the region and do not count here. |

**Vietnamese-audience indicators — exclusion test.** If any of the following is
present in the description text, the row is excluded from this card, whatever Thai
indicators it also carries:

| Indicator | Test |
|---|---|
| Vietnamese script | Latin letters with Vietnamese diacritics: `ă â đ ê ô ơ ư` in either case, or any character in U+1EA0–U+1EF9. |
| Vietnamese currency | `VND`, `₫`, `đồng`, `dong` used as a currency. |
| Vietnamese payment rails | MoMo, ZaloPay, VNPay, ViettelPay, or a Vietnamese bank name (Vietcombank, Techcombank, VietinBank, BIDV, MB Bank, ACB, Sacombank, VPBank). |
| Vietnamese contact convention | A `+84` number, or a Zalo ID or Zalo account. |
| Explicit Vietnamese reference | Vietnam, Việt Nam, Vietnamese, or a Vietnamese city or province (Hanoi / Hà Nội, Ho Chi Minh City / Sài Gòn, Da Nang / Đà Nẵng and so on). |
| Vietnamese gambling vocabulary | Terms such as `nhà cái`, `cá cược`, `cá độ`, `xổ số`, `lô đề`, `nổ hũ`, `tài xỉu`, `đá gà`, `game bài`. |

Where the description is ambiguous — no Thai indicator and no Vietnamese one, or
a mention of both markets with no clear primary audience — the row is excluded.
The card never fills a place on a guess.

**Columns.** `rank / URL / domain / brand cluster / subcategory /
Thai-targeting evidence / source`. The evidence column names the indicator and
quotes the matched string from the description text, in its original script. It
never cites the URL or domain as evidence.

**Rules.**
- The card title and every label use **gambling**, never *illegal*, *unlicensed*
  or *unranked-illegal*, per §0. The source status value is a filter only and is
  never printed.
- If fewer than ten rows qualify, render those that do and add one line giving the
  number found. Never pad the table, and never relax the Thai-audience test or the
  Vietnamese exclusion to reach ten.
- Beneath the table, one line records how many otherwise eligible ranked rows were
  excluded because their description carried a Vietnamese-audience indicator.
  Omit the line if the count is zero.
- If no row qualifies, the card is omitted and Card 1 carries a single line
  recording that no ranked gambling site in this sample carried Thai-audience
  evidence.
- Caption, directly beneath the table: *Rank reflects search visibility or
  source-feed position. It does not measure harm, revenue, user volume or
  enforcement priority.* When `sourceFeedName` is supplied (§1.1), add: *Rank is
  the position recorded in `sourceFeedName` during discovery.*
- The source column uses the display labels in §3 and carries the
  Analyst-enriched note beneath the table.

### The numbers
| Card | Content |
|---|---|
| C1 | **Metric cards row** — four small cards side by side: URLs analysed; Gambling sites; Brand clusters identified; Pilot reporting period (`days`, with `periodStart → periodEnd`). |
| C2 | **URLs analysed per day** — line chart of §6.2, with the explanatory caption specified below. |
| C3 | **Status distribution** — pie chart and a `status / count / pct` table in one card, with the Unknown note specified below. Fixed colours: Gambling `#c0392b`, Not gambling `#9aa7b4`, Unreachable `#7d3c98`, Unknown `#e67e22`. |
| C4 | **Top 10 URL suffixes** — bar chart and a `suffix / total / % of all / gambling / % gambling` table in one card. |

**C2 caption.** Two to four sentences beneath the chart, following §9.7.

- If `exportStartsLate` is true, open with one sentence: the pilot began on
  `periodStart` and this export holds records from `earliest`.
- If `largeDailySwings` is true, state the range (`dailyMin` to `dailyMax` URLs a
  day) and name the operational drivers of the variation: crawler queue timing,
  source ingestion batches, deduplication, site availability, validation delays
  and crawl strategy changes during the pilot. Present these as the normal causes
  of variation in a pilot, without implying a fault.
- Always close with: *Read daily volumes as operational processing volumes. They
  do not measure fixed daily crawl capacity.*

**C3 Unknown note.** Rendered beneath the table whenever `unknown` > 0. Three
parts, in this order:

1. Definition: *Unknown means SICPADetect collected the URL but had not assigned a
   final classification at the time of export.*
2. Handling, as three short steps: SICPADetect requeues these URLs for automated
   processing; the team identifies and addresses the cause of each unresolved
   case, naming the causes in `unknownCauses` (§1.1) when supplied; analysts
   review URLs that remain unresolved after reprocessing.
3. If `unknown` exceeds 20% of `total`, one sentence explaining the size of the
   share with the same reasons given in the Card 1b note.

The note leaves the reader knowing that the team understands these URLs and has a
plan for them. It never describes them as unexplained or as an error.

### Subcategories
Every subcategory axis in this section draws its seven columns from the product
categories in **Appendix A.1**, in the order listed there. No other value may
appear on a subcategory axis.

| Card | Content |
|---|---|
| D1 | **Gambling sites by product subcategory** — horizontal bar, descending, product palette (§9.2). Every bar carries both figures in its label: the site count and its share of gambling rows to one decimal place, in the form `{subcategory}: {count} ({pct}%)`. The share is of gambling rows, not of all rows, and the axis title says so. |
| D2 | **Assignment method by subcategory** — stacked bar; `keyword` in the subcategory colour, `inferred` in the same hue at 45% opacity. Caption carries `inferredShare` and `generalShare`. Beneath the chart and above the caption, the card carries a short **lexicon match explanation**, specified below. |
| D3 | **Subcategory table** — `subcategory / count / % of gambling / keyword-assigned / inferred / distinct clusters`. |
| D4 | **Heat map — Keyword × subcategory** — rows: the top 25 matched keywords from §6.6, each labelled with a coloured strip showing its own Appendix A category so cross-category bleed is visible. Columns: the seven product subcategories. Cell: gambling sites matching that keyword within that subcategory. |
| D5 | **Heat map — Signal tag × subcategory** — rows: the seven signal categories from Appendix A.2. Columns: the seven product subcategories. Cell: site count. Shows which products lean on promotional, payment or evasion language. |

**D2 lexicon match explanation.** A short prose block inside card D2, headed
*What a lexicon match means*. It tells a reader who has never seen the lexicon
what the two fills on the chart stand for, using the terms defined in §9.7. It
covers three points, in this order:

| Point | What it says |
|---|---|
| Lexicon match | SICPADetect assigns a subcategory by lexicon match when a recorded text field about the site contains a keyword from the gambling lexicon, and that keyword belongs to the assigned product category. The recorded fields are the model-generated site description and classification rationale (the `LLM Reasoning` field), extracted keywords, analyst remarks, and the URL and domain. Example: a site whose recorded text contains `{exampleKeyword}` is assigned to `{exampleCategory}` by lexicon match. |
| Model inference | When no product keyword appears, the model assigns the closest subcategory from what the site description and classification rationale say the site offers. State that the two methods are separate: a lexicon match rests on a specific keyword found in the text, while model inference rests on the model's reading of the site. |
| Which lexicon and why it matters | The SICPADetect Thai gambling keyword lexicon: `lexiconKeywordCount` keywords in `lexiconCategoryCount` categories, most in Thai script. Product categories decide the subcategory. The remaining categories describe how a site markets or operates itself and appear as signal tags. A lexicon match can be checked against the site and repeated, so it carries higher confidence. A larger lexicon share of a bar means that subcategory figure rests on more direct evidence. A large model inference share means the sites use vocabulary the lexicon does not yet cover. |

Rules: 110 to 160 words; plain prose, no list; no figures from the dataset
except `lexiconKeywordCount`, `lexiconCategoryCount` and the product category
count, all computed from the loaded lexicon (Appendix A); present tense; no
recommendation. `exampleKeyword` is the most frequently matched product keyword in
the dataset, in its original script, and `exampleCategory` is its category. Never
use the phrase "the model's own description". The lexicon file name belongs in the
footnote line, never in this block.

If no lexicon keyword matched at all, cards D4 and D5 are omitted and card D3
carries a single line: "No lexicon keywords matched this sample; SICPADetect
assigned every gambling row by model inference."

### Brands and clustering
| Card | Content |
|---|---|
| E0 | **What brand clusters are** — single full-width prose card, the first card in this section. Specified below. |
| E1 | **Metric cards row** — Distinct clusters; Clusters with ≥ 2 URLs; Singletons; `clustersToHalf`. |
| E2 | **Top 15 brand clusters by URL count** — horizontal bar chart; cluster names are unbounded in length and will not fit as upright labels under fifteen vertical bars. |
| E3 | **Heat map — Brand cluster × subcategory** — rows: top 20 clusters. Columns: the seven product subcategories from Appendix A.1. Cell: URL count. Multi-product operators appear as horizontal bands. |
| E4 | **Cluster expansion — `topCluster.name`** — node diagram; cluster name at the centre, member domains around it, edges styled by `mergeBasis` (solid = seed, dashed = stem, dotted = similarity). One interpretation line inside the card. |
| E5 | **Clusters spanning multiple subcategories** — table: `cluster / URL count / subcategories / suffixes`. |
| E6 | **Clusters rotating top-level domains** — table: `cluster / suffixes / counts`. |
| E7 | **Possible operator linkage** — table: `cluster A / cluster B / shared keywords / Jaccard`. Card subtitle reads "Indicative — not a clustering decision". |
| E8 | **Naming conventions** — the §6.9 bullets. |
| E9 | **Structure: direct → redirect → variant** — three small metric cards in one row. |
| E10 | **Redirect propagation — `topRedirect`** — node diagram. Rendered only when a top redirect exists. |

**E0 — What brand clusters are.** A prose card that explains the idea before any
cluster figure appears, so the rest of the section reads without reference to
this specification. Two short paragraphs, 150 to 200 words in total, headed
*What a cluster is* and *Why clusters matter*.

| Paragraph | What it says |
|---|---|
| What a cluster is | A brand cluster is a group of domains that appear linked by naming pattern, redirect behaviour, crawler relationship or shared brand stem. SICPADetect links domains in three ways. The crawler found one domain as a variant of, or a redirect from, another; this crawler relationship is the strongest basis. The domain names reduce to the same brand stem once market tags, version numbers and suffixes are removed. Or the stems differ by only a few trailing characters. A domain linked to no other is a singleton. Give one stem example drawn from the largest cluster in the dataset, showing two member domains and the stem they share. |
| Why clusters matter | Gambling operators often register many related domains, rotate top-level domains and redirect users between them, so a new address can replace a blocked one. A URL count therefore gives more addresses than there are distinct operations behind them. Clusters show how many distinct operations appear in the identified gambling URLs, how concentrated those URLs are, and which clusters offer several product types. Acting on a cluster can cover all of its related domains in one step. |

Rules: plain prose following §9.7; present tense; no figures from the dataset,
since E1 onwards carry them. The stem example comes from the current dataset and
is never copied from an earlier report. If every cluster is a singleton, omit the
example. Close with one sentence stating that clusters are an indicative
analytical grouping based on names and crawler links, that they do not establish
legal ownership, and that the linkage table (E7) is indicative. This card is
exempt from the omit-if-unavailable rule: it renders whenever the section renders,
including when every cluster is a singleton.

### Ranking
| Card | Content |
|---|---|
| F1 | **Gambling ranking** — table, top 15 by rank, or the §6.12 sample when none are ranked. Carries the same rank caption as B1 directly beneath the table, and the Analyst-enriched note from §3 beneath the source column. |

### Key insights
| Card | Content |
|---|---|
| G1–G5 | The five narrative cards in §8, one card each: title, body, and a single closing take line set apart from the body. |

## 8. The five Key Insights (narrative)

Each card has a **title**, a **body** and a one-line **take**. Compute first:
`gamblingShare`; `topClusterShare = topCluster.urlCount / gambling × 100`;
`top10Share`; the §6.11 derived counts. Every body and take follows §9.7, and
each conditional branch must read as a complete, natural sentence on its own.

| # | Card | Body | Take |
|---|---|---|---|
| 1 | **Scale of the analysis** | Distinct URLs analysed during the pilot reporting period (`days`, `periodStart` to `periodEnd`), of which `gambling` gambling, `notGambling` not gambling, `unreachable` unreachable and `unknown` awaiting final classification. Name only the outcomes above zero. If `exportStartsLate`, add that the export holds records from `earliest`. | State the gambling count and share of URLs analysed. If `days` is too short to support trends, say so. |
| 2 | **What is being offered** | The top three product subcategories with counts and shares; `generalShare` of sites confirmed as gambling without an evidenced product type; `inferredShare`; the number of lexicon keywords that never matched. | Name the largest product subcategory and its share. If it exceeds 50% of gambling rows, say that one category accounts for most of the gambling set. Otherwise say that no single category accounts for a majority and name the next largest. If `generalShare` exceeds 40%, say that the lexicon does not yet identify the product type for many sites in this dataset and name the categories with the weakest coverage. |
| 3 | **Brand clustering** | `distinctClusters` indicative clusters across `gambling` URLs; `multiUrlClusters` hold more than one domain; `clustersToHalf` clusters cover half of the identified gambling URLs; the largest, `topCluster.name`, holds `topCluster.urlCount` domains across `M` subcategories. If every cluster is a singleton, state that SICPADetect found no linked groups of domains. | If `clustersToHalf ≤ 10`: a small number of clusters hold half of the identified gambling URLs, so action on those clusters covers a large part of the set. Otherwise: the identified gambling URLs spread across many clusters, each holding a small share, so cluster prioritisation still groups related domains but each action covers fewer URLs. |
| 4 | **How operators expand and promote their domains** | `variantRows` crawler variants, `redirectRows` redirect-derived, `directRows` reached directly; busiest redirect source `topRedirect` with `topRedirect.count` destinations; `N` clusters use more than one top-level domain; the two most common signal tags with their shares. Mention only patterns whose count is above zero. | If redirects or top-level domain rotation are present: operators use them to keep users reaching their sites when individual domains change. If `Promotions` or `Vague-Evasion Terms` is among the two most common signal tags: much of the acquisition runs through promotional content, which MDES can monitor alongside search results. |
| 5 | **Enforcement position** | Use the branch that matches the data (§6.11 derived counts). **Zero** (`blockedCount = 0`): *No URL in the analysed set carried blocking or enforcement indicators. MDES can include all identified gambling URLs in a first prioritised enforcement pass.* **Most unblocked** (`mostUnblocked`): *Only `blockedCount` URLs in the analysed set already carried blocking or enforcement indicators. MDES can therefore include most identified gambling URLs in a first prioritised enforcement pass.* **Substantial share blocked** (otherwise): *`blockedCount` URLs (`blockedPct`%) already carried blocking or enforcement indicators. The remaining `unblockedGambling` identified gambling URLs are candidates for the next enforcement pass.* Use the singular form when a count is 1. | Every branch: *Cluster-based prioritisation lets MDES act on groups of related domains instead of handling each URL separately.* |

---

## 9. Output & presentation notes

### 9.1 General
- Percentages to one decimal place.
- Empty states are explicit ("No multi-URL brand clusters were detected in this
  sample."), never fabricated data. The Model Insights section is exempt: its three cards are written
  by hand after generation and render blank, with no empty-state line.
- Never present an inferred assignment as though it were keyword-derived; every
  subcategory figure carries its method split.
- Thai keywords render in their original script throughout — never transliterate or
  translate them in chart labels or tables. Where an axis cannot fit Thai text,
  wrap it before shortening it (§9.5); Thai has no word delimiters, so it wraps on
  any character. Truncate only as a last resort, and never rely on a tooltip alone
  to carry the full string — the report is read on paper as well as on screen.
- The report carries one footnote line, at the foot of the last page rather than in
  a card: `lexiconSource`, `lexiconVersion`, keyword count per tab, `inferredShare`,
  `generalShare`, the count of rows normalised from `Licensed gambling`, any
  abbreviation flagged under §2.3, the clustering thresholds used, and the
  `pilotStartDate` fallback note from §1.1 when it applies. This is the only
  place the lexicon file name and version render. There is no methodology card.
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
- Cell labels show the integer count where the cell is at least 8 mm wide and 5 mm
  tall. Below that the count is dropped and the colour scale carries the value —
  never shrink the digits to fit, and never leave the count recoverable only from
  a tooltip.
- Text flips to white above 55% fill opacity.
- Row order: descending row total. Column order: descending column total.
- Cap at 25 rows × 12 columns; overflow collapses into a final `Other` row or
  column with a note giving the number collapsed.
- Minimum 14 mm per column. The seven subcategory columns of D4, D5 and E3 sit in
  140 mm of card width once §9.4 padding is taken off; row labels therefore take
  at most 40 mm, leaving 100 mm across seven columns. Column headings wrap to two
  lines at that width — `General Gambling` and `Football Betting` will not fit on
  one — so reserve two label lines on every subcategory axis rather than letting
  the longest heading truncate.
- Every heat map carries a legend showing the count at both scale endpoints.

### 9.4 Card layout

Every block is a card. Nothing renders outside one, with the single exception of
the title page (§7), which carries no card, no border and no grid.

| Property | Value |
|---|---|
| Structure | Title, optional one-line subtitle, introduction where §9.6 requires one, body (chart, table, diagram or prose), optional caption. One idea per card. |
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

### 9.5 Chart label legibility

No label may overlap another label, a bar, a cell border, a node, or the plot
frame, and no label may be clipped by the card edge. Where a layout cannot meet
that, change the chart form — never shrink the type below the minimum and never
let two labels sit on top of each other.

| Rule | Value |
|---|---|
| Minimum type | 8 pt for any axis label, tick label, legend entry, in-cell value or node label. Nothing on a chart is smaller. |
| Long category names | Wrap to a maximum of two lines. Latin wraps at word boundaries; Thai wraps on any character, since it has no word delimiters. |
| Rotation | Category labels stay horizontal. A chart whose labels will not fit horizontally becomes a horizontal bar chart instead of rotating its labels. |
| Bar orientation | More than eight categories, or any category name over roughly 12 characters, renders horizontally. This covers D1 and E2. |
| Truncation | Last resort only, with a visible ellipsis, and only when the full string is recoverable from a table or legend **inside the same card**. A tooltip alone is not recovery. |
| Time axis | At most 12 tick labels on C2. Thin evenly and always keep the first and last date. Never let date labels collide. |
| Pie and donut | No label sits on a segment below 5%. Those values move to a legend carrying name, count and percentage. C3 uses a legend rather than leader lines. |
| Value labels on bars | Inside the bar when the bar is long enough to hold them at 8 pt with 2 mm clearance; otherwise immediately outside the bar end. |
| Legend | Below the plot, never overlapping it, never floating inside it. |
| Node diagrams | E4 and E10 place labels so that none collide. Where two would, shorten to the cluster stem and list the full names in a caption beneath the diagram. |
| Axis titles | Omitted where the card title already names the quantity, rather than repeated and competing for space. |
| Final check | Every chart is inspected after render. A clipped label, an overlapping pair, or a truncation with no in-card recovery is a defect, not an acceptable trade-off. |


---

### 9.6 Chart introductions

Every card carrying a chart, a heat map or a node diagram opens with one short
introduction, set between the card title and the figure. It says what the figure
plots. It does not say what the figure means.

**Cards that carry one:** C2, C3, C4, D1, D2, D4, D5, E2, E3, E4, E10. Table only
cards, metric card rows and prose cards do not.

| Rule | Value |
|---|---|
| Length | Two sentences at most, 40 words at most. |
| Content | What is plotted, what one unit on the figure represents, and which axis or dimension carries what. Nothing else. |
| Tense | Present. |
| Figures | None. The chart, the table and the caption carry the numbers. |
| Prohibited | Interpretation, judgement, adjectives of scale, cause, recommendation, forecast, and any phrase that tells the reader what to conclude. |
| Hyphens and dashes | None. No hyphen, no en dash, no em dash. Where a term normally takes a hyphen, use the unhyphenated spelling or rewrite the phrase. |
| Parentheses | None. Split the sentence instead. |
| Repetition | Never restates the card title. |
| Register | Plain declarative sentences. No filler openers such as "This chart shows the way in which". |
| Empty data | The card is omitted under §7, so its introduction is omitted with it. |

**Form to follow.** State the quantity, then the breakdown, then the unit.

| Card | Introduction |
|---|---|
| C2 | Daily count of URLs analysed across the pilot reporting period. Each point is one calendar day. |
| C3 | Share of URLs analysed by classification status. Each segment is one status and the table beside it carries the counts. |
| C4 | The ten most common URL suffixes among URLs analysed. Bar length is the total count and the table separates the gambling share. |
| D1 | Gambling sites by product subcategory. Bar length is the site count and each label carries the count and the share of gambling rows. |
| D2 | How each subcategory was assigned. Solid fill is a lexicon match and the lighter fill is model inference. |
| D4 | Matched keywords against product subcategory. Each cell is the number of gambling sites carrying that keyword in that subcategory. |
| D5 | Signal tags against product subcategory. Each cell is the number of gambling sites carrying that tag in that subcategory. |
| E2 | The fifteen largest brand clusters by URL count. Bar length is the number of domains in the cluster. |
| E3 | Brand clusters against product subcategory. Each cell is the number of URLs a cluster holds in that subcategory. |
| E4 | The largest brand cluster and its member domains. Edge style records why each domain joined the cluster. |
| E10 | The busiest redirect source and the destinations reached from it. Each node is one domain. |

These are the forms to follow, not fixed text. Rewrite each one from the data
actually plotted.

### 9.7 Language and terminology

These rules apply to every sentence the generator writes: card titles, prose,
captions, notes, table headings, chart labels and every branch of conditional
text. The reader is an MDES official who may read the report without a briefing.
The tone is plain, confident and constructive, and never undercuts SICPA or
SICPADetect.

**Writing rules.**

| # | Rule |
|---|---|
| 1 | Plain English and short sentences. Vary sentence length so the text does not read as mechanical. |
| 2 | Define each technical term at first use: brand cluster, lexicon match, model inference, signal tag, confidence score. |
| 3 | Active voice. Name who acts: SICPADetect, the analyst team, MDES, operators. |
| 4 | Give the computed figure instead of a verbal approximation. Write `{gamblingShare}%`, never a phrase such as "just under three in ten". |
| 5 | No adverbs or filler: really, just, simply, notably, importantly, "it's worth noting". |
| 6 | No metaphors that need decoding. Never use "estate"; write "identified gambling URLs" or "identified gambling domain set". |
| 7 | No "not X but Y" contrasts, no rhetorical questions, no punchy one-line paragraph endings. |
| 8 | No em dashes in rendered text. Use commas, colons or full stops. |
| 9 | Label findings based on clustering, shared signals or inferred relationships as *indicative*. Never imply legal ownership. |
| 10 | State limitations constructively: say what the figure shows and what would strengthen it. |

**Phrases that never render.** "just under three in ten"; "collapsing domains
onto the operator"; "estate is grown mechanically"; "one product type accounts
for even two fifths"; "the estate is diffuse"; "very small share"; "almost no
page"; "enforcement has barely touched this set"; "we are ahead of enforcement
rather than behind it"; "the model's own description"; and any sentence that
suggests SICPA's own results work against it.

**Terminology.** One term per concept, everywhere in the report.

| Concept | Term to use | Meaning |
|---|---|---|
| Source system | **SICPADetect** | The system that produced the export. |
| Time frame | **pilot reporting period** | `periodStart` to `periodEnd` (§6.2). Never "evaluation period" or "export window". |
| Count basis | **URLs analysed** | Distinct URLs kept after collection, filtering, deduplication and analysis. |
| Automated process | **SICPADetect automated analysis** | Crawling, text extraction and classification that SICPADetect performs without human input. |
| Human step | **analyst enrichment** | An analyst verifies or adds information after automated detection. Source label: Analyst-enriched. |
| Keyword method | **lexicon match** | A recorded text field contains a keyword from the gambling lexicon linked to the assigned category. |
| Model method | **model inference** | The model assigns a subcategory from page content, metadata, extracted text or the site description, with no exact keyword match. |
| Model text field | **model-generated site description and classification rationale** | The `LLM Reasoning` column. |
| Unresolved status | **Unknown** / **status not yet resolved** | Collected but not yet given a final classification at export. |

**Before output.** Search the rendered text for "estate", "evaluation period",
"just under", "Manual (" and "—". Confirm that no figure, date, category name,
stem example or ranking comes from anywhere other than the current dataset or a
§1.1 parameter.

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
rows of heat map D5.

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
