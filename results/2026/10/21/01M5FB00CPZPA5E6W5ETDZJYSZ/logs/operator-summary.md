# Operator summary, job 01M5FB00CPZPA5E6W5ETDZJYSZ (attempt 2)

Attempt 1 lease lapsed before the result was written; attempt 2 reclaimed the job and wrote the result. Spec version 12 applied: stems and clusters are built per registrable domain, with domain concentration and host farms added.

## Assumptions
- Status mapping: BLACKLISTED = Gambling, WHITELISTED = Not gambling. The export holds no Unreachable, Unknown or Needs more analysis rows, so those figures are zero and the unreachable, needs-analysis and redirect cards are omitted.
- The export has no URL, seed, variant, redirect or HTTP status data. Label = host; every gambling URL counts as direct; seed linkage never applied; host-farm fetch evidence reads not recorded.
- "Updated at" = updatedAt (UTC dates). Source = pipeline source where present, otherwise "Not recorded".
- The reasoning pass is a rule-based reading of reasoning text and classifier tags (first product named wins). Inferred share is 96.7%, so the report states the lexicon has poor coverage.
- Domain = registrable domain from the Public Suffix List including private suffixes. 6,827 domains carry the 14,182 gambling URLs. One domain, 49m.co, carries 20.3% of gambling URLs, above the 10% domain dominance limit; 15 host farms (20 or more URLs) carry 35.1%.
- The largest cluster (49m) sits on one domain, so the cluster expansion diagram shows the largest cluster with at least 3 domains (jun8), as the spec requires, and says why.
- Template-only names: 1 domain, kept as a singleton.
- Operator linkage: 118 pairs qualify after exclusions; the discrimination check passes, so the table is shown.
- Generic-name check passes for the 20 largest clusters.
- Gaps: 3 gaps against the mean-based threshold (64 URLs a day); the plotted series agrees. No cause is recorded because no operations log was supplied.
- Short abbreviations (PG, PP, FC, XO, SA, WM, AG, AE) count only as standalone tokens in domain text.
- Collection network, operations log, report reference and classification were not supplied and are marked not recorded or omitted.
- The 7 block-phrase hits are not Thai-authority indicators; excerpts show unrelated pages.
- Fonts are not embedded; Thai text uses Tahoma as the complex-script font. Card corners are square. Contents page numbers are cached from a LibreOffice render.
- Asset stored with storage kind git (no LFS configured in this repository).
