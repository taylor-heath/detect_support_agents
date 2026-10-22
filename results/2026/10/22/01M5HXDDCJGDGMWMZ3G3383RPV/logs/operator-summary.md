# Operator summary, job 01M5HXDDCJGDGMWMZ3G3383RPV (attempt 3)

## Input and mapping
- Input is the rows list of dataset.json.gz (29,976 rows, one per hostname); spec.md and dataset.json.gz were checked against their sha256 values.
- BLACKLISTED read as Gambling (14,182), WHITELISTED as Not gambling (15,682). ANALYSIS_ERROR (112 rows) read as Unreachable, as this spec version requires; card "Unreachable URLs by cause" renders with the single cause "Analysis error". No Unknown, Needs more analysis or Licensed rows.
- No URL path, seed, variant, redirect or fetch diagnostics in the rows: label is the host, every gambling URL counts as direct, variant verification reads not recorded.
- Source is the pipeline source; one or two character values (x) read Not recorded.
- Not supplied, so omitted or marked not recorded: report reference, document classification, collection network, operations log.

## Judgement calls
- Registrable domains from the Public Suffix List including private suffixes (publicsuffixlist package).
- Reasoning pass uses the LLM description only: the product named most often wins, none named gives General Gambling, empty description gives Unspecified (458 URLs). Inferred share is 96.7 percent, so the report states poor lexicon coverage.
- Near-miss merge: Jaro-Winkler 0.90 or more with a prefix relation or a difference in the last character only, among unanchored stems.
- Heat map columns follow descending column total (section 9.3). Heat maps are Word tables with shaded cells, so Thai text is shaped by the Word renderer.
- Cards E5, E6, E7, F1 and F2 list the top 15 (E6 limited to 5 clusters, 4 suffixes each); counts outside are stated. E4a omitted: the largest cluster has one member stem. E4 shows the largest cluster with at least 3 domains. E10 and E11 omitted: no data.
- Model Insights cards are blank apart from the fixed introduction.
- Asset stored with storage.kind git, as for earlier jobs on this branch; the repository has no Git LFS configuration.

## Known limits
- Rendered with LibreOffice to 38 pages; not opened in Microsoft Word. Card corners are square (Word tables cannot round them). Annex titles do not repeat with "(continued)" on continuation pages; the table header row repeats.
- Contents page numbers are cached PAGEREF values from the LibreOffice render and stay stable across two builds.
- The lease lapsed once during the run and was reclaimed (attempts 2 and 3).
