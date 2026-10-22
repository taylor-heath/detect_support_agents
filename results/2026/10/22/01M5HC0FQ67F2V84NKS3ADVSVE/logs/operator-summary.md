# Operator summary, job 01M5HC0FQ67F2V84NKS3ADVSVE (attempt 1)

Ten Confirmed records (status BLACKLISTED), one per domain, each built from the current decision and its homepage capture. All ten capture files matched the SHA-256 values in request.json and the dataset.

## Values changed from the source record
- Source field, all records: "Manual", the Claude tool name and the operator user name removed. Records with a discovery source read "SICPADetect (X: <search term>)". The X account handle is left out because it may be personal data.
- ufa350d.com and raprnb.com: nothing remained after removal, so the value is "SICPADetect automated classification pipeline".
- kohochocolates.com and bifestathailand.com: the source reads "SICPADetect (Redirect: <seed domain>)" from the decision author.
- Rationale: SICPADetect reasons rewritten as visual and functional evidence lines without the "Screenshot:" prefix. Lines for the 3 records that share a capture are identical.
- Confidence: 95 mapped to High (g-a) for all records.
- Capture time: the BLACKLISTED classification step timestamp, converted from UTC (Z) to +07:00. The instant is unchanged.

## E2 placeholders inserted
None. Every record has a classification timestamp, a capture file and an image hash.
- Record hash reads "Not available" in all ten records because SICPADetect supplied none.
- Report reference reads "Not available" because the request carries none.

## Records whose capture is not valid
None. The dataset holds no capture validation result and no validation reasons, so under rule 14A step 3 every record reads Yes. For an analyst to confirm:
- Every capture shows a Chrome update notice at top right. Most also show a Google Translate bar over part of the page header.
- bifestathailand.com and lgbtnewsnow.org (shared capture): the menu labels render as empty boxes, so their Thai text cannot be read.
- No capture shows a system clock.

## Redirect lines
Classified URL, captured URL (from the address bar in the capture), and how the redirect is recorded:
- metal--vip.com: https://metal--vip.com/ to https://metal--vip.com/login. Redirect not recorded.
- anthonyhead.com: https://anthonyhead.com/ to https://kohochocolates.com. Redirect not recorded. The record kohochocolates.com carries the source "Redirect (anthonyhead.com)".
- bifestathailand.com: https://www.bifestathailand.com/contact.html to https://www.humanitiesweb.org. Recorded as the source "SICPADetect (Redirect)" (lgbtnewsnow.org).
- lgbtnewsnow.org: https://lgbtnewsnow.org/ to https://www.humanitiesweb.org. Redirect not recorded.
- raprnb.com: https://raprnb.com to https://kosova.org. Redirect not recorded. An older decision of this record carries the source "Redirect (qpfc.com)".
- kohochocolates.com, sacasino.ad, awayge.farm, ufa350d.com and wingame.games: classified and captured URLs match, so no Redirect line.

## SICPADetect No changed to Yes under E4
None.

## Assumptions and judgement calls
- Page source (homepage-html) was not included in the evidence, so keywords come from the screenshot only. Text split across two lines by wrapping was not joined (for example raprnb.com, "ราคา" then "บอล").
- Subcategory is the product set with the most matched keywords. awayge.farm ties Slots and Playing card on one keyword each, so the SICPADetect tag order (slots first) decides: Slots.
- metal--vip.com matched no keyword. It reads Slots because the capture shows a METAL SLOT AUTO logo and SICPADetect tags it slots. Keywords detected reads "None matched".
- wingame.games reads Casino (2 keywords against 1 for Slots), although the page also carries a slot game grid.
- sacasino.ad reads Casino (5 keywords against 1 each for Baccarat and Slots).
- "X" as the discovery source is read from the pipeline source "x" and the tag "x:@handle".
- Title of classification is "<domain>: <subcategory>". Date of issue is the run date.
- The asset is stored with storage kind git because no LFS is configured in this repository.
