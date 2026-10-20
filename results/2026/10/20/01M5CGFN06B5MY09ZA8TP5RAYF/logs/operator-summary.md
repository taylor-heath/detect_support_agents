# Operator summary, job 01M5CGFN06B5MY09ZA8TP5RAYF (attempt 1)

## Values changed from the source record
- Source field: "Manual (claude.ai)" became "SICPADetect automated classification pipeline" for anthonyhead.com, lgbtnewsnow.org and awayge.farm.
- Source field: "Manual (<analyst username>)" became "SICPADetect automated classification pipeline" for u11k.pro and metal--vip.com. The username is personal data and was removed.
- Source field: Variant and Redirect seeds kept in brackets for 707jili.com, ktvgame88.tv, www.lardoriodao.com, www.jum88.site and bifestathailand.com.
- Pipeline source "x" and its account tags exist on 4 records (anthonyhead.com, lgbtnewsnow.org, awayge.farm, metal--vip.com). They were not used for the Source value because they carry account handles.
- Confidence 95 and 90 mapped to High. Timestamps converted from UTC to +07:00.

## E2 placeholders inserted
None. Every record has a screenshot, a classification timestamp and a SHA-256 hash computed from its capture file.

## Redirect lines (rule 14B)
None inserted. No record holds a redirect from its classified URL to the URL its capture shows.
- bifestathailand.com carries Redirect source metadata naming lgbtnewsnow.org, but the capture shows www.humanitiesweb.org. lgbtnewsnow.org shows the same page and the same address. The record does not hold the redirect to humanitiesweb.org, so I treated both as V4 failures. If the redirect chain is added to the records, both qualify for a Redirect line and read Yes.

## Records whose capture is not valid
No SICPADetect validation result exists in the dataset, so every reason below comes from my own check of the capture file (not from the SICPADetect result).
- anthonyhead.com: V4 (screenshot URL is kohochocolates.com)
- lgbtnewsnow.org: V4 (screenshot URL is www.humanitiesweb.org)
- bifestathailand.com: V4 (screenshot URL is www.humanitiesweb.org)
- u11k.pro: V4 (screenshot URL is play1.u11k.pro)
- 707jili.com: V2 (no address bar), V3 (pop-up over the page centre)
- www.lardoriodao.com: V2 (no address bar)
- www.jum88.site: V2 (no address bar)
Valid: awayge.farm, ktvgame88.tv, metal--vip.com (the capture shows the /login page of the same host, noted under Capture integrity).

## Open points for review
- No capture contains a system clock. I did not treat that as a V2 failure, because SICPADetect captures are browser viewport images. If the clock is required, all ten captures fail V2.
- V4 compares hosts. A path on the same host (metal--vip.com/login) was not treated as a mismatch. A different subdomain (play1.u11k.pro) was.
- metal--vip.com is assigned Slots from the METAL SLOT AUTO logo and tab title. No Thai Slots keyword is visible on the login page, so Keywords detected reads None matched.
- u11k.pro is Football Betting (sports betting branding). No Football Betting keyword is visible, so Keywords detected reads None matched.
- Keywords were read from the capture images by eye. No OCR tool was available.
