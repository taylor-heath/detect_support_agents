# report.custom 01M4ART56BDT9XY8XHVBBPYQDE - attempt 1

Data Insights & Patterns (MDES edition), rendered as `report.docx`. 22 pages.

## Input

All three declared attachments verified byte-identical against the `sha256`
values in `request.json`; `params.specSha256` matches `spec.md`.

`execution` carried no range (`rangeField`, `rangeFrom`, `rangeTo`,
`rangeExpression` all null) and `query` was empty, so the whole dataset was used
with no range filter applied and nothing re-resolved.

- `dataset.csv` parses to 24,653 records. `reportedTotal` is 24,659, which counts
  file lines; 6 records carry embedded newlines inside quoted `LLM Reasoning`
  fields. The CSV parse is authoritative.
- All 9 required columns present. None of the optional columns
  (`Legal entity`, `Interesting Keywords`, `Remarks`, ...) are present, so
  `legalEntity` and `legalEntityCountry` are empty throughout and evidence text
  is `LLM Reasoning` + `URL` + `Domain` only.
- Statuses present: `Illegal gambling` (11,696) and `Not gambling` (12,957).
  Zero rows arrived as `Licensed gambling`; the footnote states this.
  No `Review needed`, `Unreachable` or `Unknown` rows.
- Working set: 24,605 after dropping 48 duplicate URLs. No rows dropped for
  `Review needed`.

## Findings worth an operator's attention

**Lexicon coverage is poor for this dataset.** 96.3% of subcategory assignments
were made by reasoning inference, not by a lexicon keyword match, and 212 of the
286 lexicon keywords never matched a single row. The lexicon is Thai; the
descriptions in this sample are predominantly English. Per spec 4.6 the report
states plainly that subcategory figures are indicative only, in the D2 caption
and in Key Insight 2. `generalShare` is 25.0%, below the 40% threshold.

**Abbreviation false positives.** `VIP` accounts for 46.2% and `BET` for 27.6% of
all `Abbreviations` tab matches, both over the 20% threshold in spec 2.3. Both
are flagged in the footnote as probable false-positive sources. They are the top
two keywords in the D4 heat map, so that heat map is substantially driven by two
weak Latin tokens.

**Clustering.** 1,533 clusters over 11,648 gambling URLs; 1,030 hold more than
one domain; 166 clusters are needed to cover half the estate, so insight 3 takes
the diffuse branch. Largest cluster `jun` holds 568 URLs (4.9%).

Note on spec 5.2 rule 1: it is read as written, that a Variant or Redirect row
*joins the cluster of* `stem(seed)`. Reading it instead as a union of the row's
own stem with the seed's stem makes the crawler's variant graph one connected
component and collapses 82% of the estate into a single cluster named after a
one-character stem, which is not a usable result. The literal reading is used.

**Spec 5.1 step 4 and its worked example disagree.** The affix list
(`th|thai|aff|affiliate|vip|official|v\d+|\d+`) does not reduce `siam855thb5` to
`siam`, because `thb` is not in the list. The normative list is applied; the E0
stem example is drawn from the largest cluster instead, as spec E0 permits.

**Spec 5.2 rule 3 and its worked example disagree.** Standard Jaro-Winkler scores
`dafabet`/`dafawining` at 0.79, below the stated 0.90 floor, so that pair would
not merge. "Never merge below 0.90" is treated as normative.

**Possible operator linkage (E7).** A pair sharing a single signal keyword scores
a Jaccard of 1.00 trivially, which filled the table with noise. A fingerprint of
at least two shared keywords is required; the threshold is recorded in the
footnote. 146 pairs qualify.

**Card B1.** 10 of 10 places filled. 10 otherwise eligible ranked rows were
excluded on a Vietnamese-audience indicator, and that count is printed beneath
the table as the spec requires.

## Deviations

- **Git, not LFS (spec 5).** The repository has no `.gitattributes` and LFS is
  not initialised. Tracking `assets/**` requires writing `.gitattributes` at the
  repository root, which section 2.1 forbids this agent from doing. The asset is
  committed as a plain git blob with `storage.kind: "git"`, matching every prior
  result in this repository. At 859 KiB it is well inside the 25 MB limit.
  Initialising LFS needs a root-level commit from someone permitted to make one.
- **Blocklist feed (spec 6.13) is computed but not emitted as an asset.**
  `expectedAssets` names only `report.docx`, and spec 5 requires every asset
  `name` to match an `expectedAssets[].name`. The feed covers all 11,648
  gambling rows and can be emitted on a later attempt if the request declares it.
- **Contents card uses internal links, not page numbers.** Spec Card 0 allows
  this where the renderer does not paginate at build time. Headings use real Word
  heading styles, so Word's navigation pane and any user-inserted table of
  contents field resolve correctly.
- `Unspecified` is reserved for gambling rows with empty `LLM Reasoning`
  (spec 4.4 constraint 6). No row in this dataset hit that case, so every
  subcategory axis carries only the seven Appendix A.1 values.

## Verification

Rendered to PDF and every page inspected. Defects found and fixed during the
run: colliding date ticks on C2; category strips on D4 misaligned against the
reordered rows; connector lines crossing labels in the E4 and E10 node diagrams,
rebuilt as a single column; tables overflowing their cards, pinned to a fixed
layout; a clipped hub label and a legend collision on E10; the footnote line
splitting across pages.

Prose budgets checked programmatically: Part 1a 236 words and 5 figures
(limits 250 and 6), D2 130 words (90-130), E0 200 words (150-200), and all 11
chart introductions within two sentences and 40 words with no digits, dashes or
parentheses.

Terminology scan of the rendered text: `illegal`, `unlicensed` and
`Analyst Enriched` appear zero times; `Licensed` appears once, in the footnote,
exactly as spec 1 requires.
