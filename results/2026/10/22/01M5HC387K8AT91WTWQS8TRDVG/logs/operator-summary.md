# Operator summary, job 01M5HC387K8AT91WTWQS8TRDVG (attempt 2)

Attempt 1 held the claim but its lease lapsed with no result. Attempt 2 reclaimed the job and wrote the result. Spec version 13 applied.

## Input and mapping
- The input is the `rows` list of dataset.json.gz, not a CSV export. 29,864 rows, one per domain. All carry status BLACKLISTED (14,182) or WHITELISTED (15,682). BLACKLISTED reads as Gambling and WHITELISTED as Not gambling. There are no Unreachable, Unknown, Needs more analysis or Licensed gambling rows, so those figures are zero.
- The rows hold no URL path, referrer seed, variant or redirect link, HTTP status or fetch error. Label is the host. Every gambling URL counts as direct. Seed linkage is never applied. Variant verification and host farm fetch evidence read "not recorded".
- "Updated at" is updatedAt, as a UTC date. Source is the pipeline source where present and "Not recorded" otherwise. A one or two character value such as `x` reads "Not recorded", as spec 13 requires. Values such as `country-ranking` render as recorded.
- Not supplied, so omitted or marked not recorded: report reference, document classification, collection network, operations log. Every gap and peak therefore reads "cause not recorded".
- Evidence text is the model description joined with the host. The export has no Interesting Keywords or Remarks. The two letter abbreviations (PG, PP, FC, XO, SA, WM, AG, AE) count only as host tokens.

## Judgement calls
- Reasoning pass: the product named first in the description wins. Where the description names none, the classifier tags (slots, casino, betting and so on) decide. An empty description reads Unspecified (458 URLs). Inferred share is 96.7%, so the report states that the lexicon has poor coverage.
- Near-miss merge: Jaro-Winkler 0.90 or more, and one stem is a prefix of the other or the two differ only in the last character. The cluster name is the shortest member stem, ties going to the stem with more URLs.
- Largest cluster 49m sits on one domain and one stem, so Inside the largest cluster is omitted and Cluster expansion shows jun8, the largest cluster with 3 or more domains. Redirect propagation and Needs more analysis URLs linked to known clusters are omitted for lack of data.
- Template-only names: none found, so that line is omitted from Naming conventions.
- Heat map columns follow descending column total (rule 9.3), drawn from the seven product subcategories.
- The 10 most prominent gambling sites table applies the Thai indicator tests to the model description only, keeps the best ranked row per domain and found no Vietnamese exclusions.
- Tables shorten a token that cannot fit its column with an ellipsis and list the full strings beneath the table.
- Annex 1 keywords carry invisible U+2060 word joiners so that no keyword breaks across lines. Remove them before any character match against Appendix A.

## Checks run
Reconciliation identities of section 6.19 hold, with the build stopping on any failure. A scan of the document text found no *gaming*, *Review needed*, *Analyst Enriched*, singular or plural mismatch, repeated word or em dash. The word *illegal* appears only inside quoted block page phrases and excerpts in Pages showing blocking indicators.
Rendered with LibreOffice to 36 pages. Thai text, headings, contents page numbers and page breaks were inspected there. The document was not opened in Microsoft Word. Contents page numbers are PAGEREF fields with cached values from that render. Thai text uses Tahoma as the complex script font, and fonts are not embedded.
The blocklist feed of section 6.13 is not produced because the request expects only report.docx.
