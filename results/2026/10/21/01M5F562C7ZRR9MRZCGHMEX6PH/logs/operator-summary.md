# Operator summary, job 01M5F562C7ZRR9MRZCGHMEX6PH (attempt 1)

## Values changed from the source record
- Source field: "Manual (<analyst username>)" became "SICPADetect automated classification pipeline" for 707jili.com, u11k.pro and metal--vip.com; the username is personal data and was removed. "Manual (claude.ai)" became the same value for anthonyhead.com, lgbtnewsnow.org and awayge.farm. Variant and Redirect seeds kept in brackets for www.lardoriodao.com, www.jum88.site, ktvgame88.tv and bifestathailand.com.
- Confidence 95 and 90 mapped to High. Timestamps converted from UTC to +07:00 (classification step, BLACKLISTED).
- Pipeline source "x" and its account tags were not used for the Source value because they carry account handles.

## Captures used
- Changed since the previous report: 707jili.com now uses decision 4090cc54 (captured 2026-10-21), u11k.pro uses f3363249 (2026-10-19) and metal--vip.com uses bf84fde0 (2026-10-21). These are the current decisions in the dataset and all show an address bar. The other seven are unchanged. Every embedded file matches its recorded SHA-256.

## E2 placeholders inserted
None.

## Records whose capture is not valid (own check, no SICPADetect validation result in the dataset)
- 707jili.com: V3 (pop-up over the page centre)
- www.lardoriodao.com: V2 (no address bar)
- www.jum88.site: V2 (no address bar)

## Redirect lines (rule 14B)
All six are "redirect not recorded": the dataset holds no redirect chain, final URL or status code. The captured URL comes from the address bar.
- anthonyhead.com: classified https://anthonyhead.com/, captured https://kohochocolates.com
- lgbtnewsnow.org: classified https://lgbtnewsnow.org/, captured https://www.humanitiesweb.org
- bifestathailand.com: classified https://www.bifestathailand.com/contact.html, captured https://www.humanitiesweb.org (source is Redirect (lgbtnewsnow.org))
- 707jili.com: classified https://707jili.com, captured https://www.707jili.com
- u11k.pro: classified https://u11k.pro, captured https://play1.u11k.pro
- metal--vip.com: classified https://metal--vip.com/, captured https://metal--vip.com/login

## SICPADetect No became Yes under E4
None: the dataset has no SICPADetect validation result.

## Open points for review
- No capture contains a system clock. I did not treat that as a V2 failure for captures with an address bar. If required, all ten fail V2.
- Seven captures show a browser update notice and, in five, a translation bar over the top-right of the page header. I did not treat these as V3 overlays because the page content stays readable; an analyst may decide otherwise.
- Keywords were read from the images by eye; no OCR or page source was available. u11k.pro and metal--vip.com read None matched.
- Subcategory for u11k.pro stays Football Betting (as in the previous report); its page also carries slot and casino rows.
- The Login and Register buttons of u11k.pro are hidden behind the browser notice, so its functional evidence omits them.
