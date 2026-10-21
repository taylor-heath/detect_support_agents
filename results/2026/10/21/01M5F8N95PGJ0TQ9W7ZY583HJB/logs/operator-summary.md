# Operator summary, job 01M5F8N95PGJ0TQ9W7ZY583HJB (attempt 1)

Revised spec (version 11) applied: template-token stems, number rule, mean-based gaps and peaks, stricter operator linkage with discrimination check.

## Assumptions
- Status mapping: BLACKLISTED = Gambling, WHITELISTED = Not gambling. The export holds no Unreachable, Unknown or Needs more analysis rows, so those figures are zero and the unreachable, needs-analysis and redirect cards are omitted.
- The export has no URL, seed, variant or redirect data. Label = domain; every gambling URL counts as direct; seed linkage never applied.
- "Updated at" = updatedAt (UTC dates). Source = pipeline source where present, otherwise "Not recorded".
- The reasoning pass is a rule-based reading of reasoning text and classifier tags (first product named wins). Inferred share is 96.7%, so the report states the lexicon has poor coverage.
- Leading www, m, mobile, th and app parts are also removed after template tokens are dropped (repeat of step 2), so hostname trains such as account.login.www.49m.co reduce to 49m.
- 124 template-only gambling URLs are kept as singletons named by their domain.
- Gap check: 3 gaps found against the mean-based threshold (64 URLs a day); the plotted series agrees. No cause is recorded because no operations log was supplied.
- Operator linkage: 117 pairs qualify after exclusions (VIP, BET and keywords in over 10% of rows); the discrimination check passes, so the table is shown.
- Generic-name check passes for the 20 largest clusters. Two names in the Top 15 chart, sitejin and sitejin88mmpaes, may belong to one brand (site-jin88 on two hosts); the stem rules do not join them and I did not merge them by hand.
- The largest cluster, 49m, is one hostname template across many domains; it holds 20.3% of gambling URLs, below the 25% dominance limit.
- Short abbreviations (PG, PP, FC, XO, SA, WM, AG, AE) count only as standalone tokens in domain text.
- Collection network, operations log, report reference and classification were not supplied and are marked not recorded or omitted.
- The 7 block-phrase hits are not Thai-authority indicators; excerpts show unrelated pages.
- Fonts are not embedded; Thai text uses Tahoma as the complex-script font. Card corners are square. Contents page numbers are cached from a LibreOffice render.
- Asset stored with storage kind git (no LFS configured in this repository).
