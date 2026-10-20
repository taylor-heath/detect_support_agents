# Operator summary, job 01M5CKSJ0BGJP2DZW5MBQ85CWY (attempt 2)

## Values changed from the source record
- Source field: "Manual (claude.ai)" became "SICPADetect automated classification pipeline" for anthonyhead.com, lgbtnewsnow.org, awayge.farm and metal--vip.com.
- Source field: "Manual (<analyst username>)" became "SICPADetect automated classification pipeline" for u11k.pro (earlier decision) and metal--vip.com (earlier decision) where it appeared; the username is personal data and was removed.
- Source field: "Variant (u11k.net)" became "SICPADetect (Variant: u11k.net)" for u11k.pro. Variant and Redirect seeds kept in brackets for 707jili.com, ktvgame88.tv, www.lardoriodao.com, www.jum88.site and bifestathailand.com.
- Pipeline source "x" and its account tags were not used for the Source value because they carry account handles.
- Confidence 95 and 90 mapped to High. Timestamps converted from UTC to +07:00.

## Captures used
- Screenshots changed in this request. u11k.pro uses decision bc407065 (https://u11k.pro/, 2026-10-04) and metal--vip.com uses decision 2ba67145 (https://metal--vip.com/, 2026-10-05). Both are full-page captures without a browser frame. The other eight captures are unchanged.
- Classification timestamps come from the BLACKLISTED/ANALYSIS_DONE step of each decision.

## E2 placeholders inserted
None.

## Records whose capture is not valid (own check, no SICPADetect validation result in the dataset)
- 707jili.com: V2 (no address bar), V3 (pop-up over the page centre)
- www.lardoriodao.com: V2 (no address bar)
- www.jum88.site: V2 (no address bar)
- u11k.pro: V2 (no address bar)
- metal--vip.com: V2 (no address bar)

## Redirect lines (rule 14B)
All four are "redirect not recorded": the dataset holds no redirect chain, final URL or status code. The captured URL comes from the address bar.
- anthonyhead.com: classified https://anthonyhead.com/, captured https://kohochocolates.com
- lgbtnewsnow.org: classified https://lgbtnewsnow.org/, captured https://www.humanitiesweb.org
- bifestathailand.com: classified https://www.bifestathailand.com/contact.html, captured https://www.humanitiesweb.org. The source is Redirect (lgbtnewsnow.org).
No Redirect line on the five no-address-bar records or on awayge.farm and ktvgame88.tv (captured host and path equal the classified URL).

## SICPADetect No became Yes under E4
None: the dataset has no SICPADetect validation result. The three Redirect records above read Yes because no other check fails (they read No in the previous job under a V4 check that the revised spec removes).

## Open points for review
- No capture contains a system clock. I did not treat that as a V2 failure for captures that otherwise show an address bar. If required, all ten fail V2.
- u11k.pro Keywords detected reads None matched (no Football Betting keyword visible); metal--vip.com reads None matched (no Slots keyword visible). Keywords were read from the images by eye; no OCR was available.
- Attempt 1 lease lapsed before the result; this is attempt 2.
