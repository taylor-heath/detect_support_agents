# Operator summary, job 01M5KSHW5ED2XKT66A624EVWWK (attempt 1)

- Inputs: spec.md and dataset.json.gz verified against their sha256 values; 29,976 rows, one per hostname, no URL paths.
- BLACKLISTED read as Gambling, WHITELISTED as Not gambling, ANALYSIS_ERROR (112) as Unreachable. No Needs more analysis, duplicates or Licensed rows.
- Source: seeds from "Redirect (x)" / "Variant (x)" were used for seed linkage. Source "System" has no category in the spec and renders as its raw value.
- Not supplied, so shown as not recorded or omitted: report reference, document classification, collection network, operations log.
- Reasoning pass is a keyword heuristic over the English description (no model call); inferred share is 96.7%, so the report states poor lexicon coverage.
- Near-miss merge: Jaro-Winkler >= 0.90 with prefix relation or last-character difference; stems differing only in digits are not merged (keeps jun88 and jun68 apart).
- Seed link wins for a domain when at least half of its URLs carry it (ties to seed); otherwise anchor, then stem.
- Operator linkage fails the discrimination check, so the table is replaced by the one-line statement.
- E5/E6 list the largest clusters only (15 and 6), with outside counts stated. E4a omitted (largest cluster has one member stem). E11 omitted (no data).
- Model Insights cards are blank apart from the fixed introduction.
- Asset stored as storage.kind git: the repository has no Git LFS configuration.
## Known limits
- Rendered with LibreOffice (39 pages), not opened in Word. Card corners are square. Annex titles do not repeat "(continued)". Contents page numbers are cached PAGEREF values.
- Pre-issue checks run: banned wording scan and Thai render spot check; word-count limits on prose blocks were not machine verified.

## Attempt 2 changes
- Author System is no longer shown; such rows show Not recorded, or their pipeline source when one exists.
- pipeline.sources enrich the source label and a new card, Discovery sources recorded by the pipeline.
- Variants classified gambling: the dataset has none. All 7,805 rows authored by the variant step are WHITELISTED with no description, so the variant count stays 0; they were not reclassified.
