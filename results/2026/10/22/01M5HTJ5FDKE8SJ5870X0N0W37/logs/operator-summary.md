# Operator summary, job 01M5HTJ5FDKE8SJ5870X0N0W37 (attempt 1)

## Input and mapping
- Input is the rows list of dataset.json.gz (29,976 rows, one per domain). BLACKLISTED read as Gambling (14,182), WHITELISTED as Not gambling (15,682). ANALYSIS_ERROR (112 rows, no description) read as Unknown, since it is outside the mapped values. No Unreachable, Needs more analysis or Licensed rows.
- No URL path, seed, variant, redirect or fetch diagnostics in the rows: label is the host, every gambling URL counts as direct, variant verification reads not recorded.
- Source is the pipeline source; one or two character values (x) read Not recorded.
- Not supplied, so omitted or marked not recorded: report reference, document classification, collection network, operations log.

## Judgement calls
- Reasoning pass uses the description text only: first product named wins, no product named gives General Gambling, empty description gives Unspecified (458 URLs). Inferred share is 96.7 percent, so the report states poor lexicon coverage.
- Near-miss merge: Jaro-Winkler 0.90 or more with a prefix relation or a difference in the last character only, among unanchored stems.
- Model Insights cards are blank apart from the fixed introduction. Heat map columns follow descending column total (section 9.3).
- E5, E6, E7, F1 and F2 list the top 15 (E6 capped at 24 lines); counts outside are stated. E4a omitted: the largest cluster has one member stem. E10 and E11 omitted: no data.
- Asset stored with storage.kind git, as for earlier jobs on this branch; the repository has no Git LFS configuration.

## Checks run
Reconciliation identities hold. Rendered with LibreOffice to 35 pages with no blank pages. Contents page numbers are PAGEREF fields with cached values from that render. Not opened in Microsoft Word. Card corners are square.
