# Operator summary, job 01M5F4PNH8SADMYBEH46NC2NBS (attempt 2)

Attempt 1 lease lapsed before the result was written; attempt 2 reclaimed the job and wrote the result.

## Assumptions
- Status mapping: BLACKLISTED = Gambling, WHITELISTED = Not gambling. The export holds no Unreachable, Unknown or Needs more analysis rows, so those figures are zero and the unreachable, needs-analysis and redirect cards are omitted.
- The export has no URL, seed, variant or redirect data. Label = domain; every gambling URL counts as direct; seed linkage never applied.
- "Updated at" = updatedAt (UTC dates). Source = pipeline source where present, otherwise "Not recorded".
- Reasoning pass is a rule-based reading of reasoning text and classifier tags (first product named wins). Inferred share is 96.7%, so the report states the lexicon has poor coverage.
- Clustering follows spec 5.1 literally: subdomain trains stay separate stems, and near-miss merging joins stems such as verify and verifyk. Generic names (verify, secure, login) therefore appear as large clusters.
- Short abbreviations (PG, PP, FC, XO, SA, WM, AG, AE) count only as standalone tokens in domain text.
- Collection network, operations log, report reference and classification were not supplied and are marked not recorded or omitted.
- The 7 block-phrase hits are not Thai-authority indicators; excerpts show unrelated pages.
- Fonts are not embedded; Thai text uses Tahoma as the complex-script font. Card corners are square. Contents page numbers are cached from a LibreOffice render.
- Asset stored with storage kind git (no LFS configured in this repository; file is 0.7 MB), as in earlier jobs.
