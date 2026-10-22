# Operator summary, job 01M5FA7RY5TPVCSS443BJWX7NX (attempt 1)

## Values changed from the source record
- Source field: "Manual (<analyst username>)" became "SICPADetect automated classification pipeline" for metal--vip.com, ufa350d.com and wingame.games; the username is personal data and was removed. "Manual (claude.ai)" became the same value for anthonyhead.com, lgbtnewsnow.org, sacasino.ad and awayge.farm. Redirect seeds kept in brackets for kohochocolates.com, bifestathailand.com and raprnb.com.
- Confidence 95 mapped to High. Timestamps converted from UTC to +07:00 (classification step, BLACKLISTED).
- Pipeline source "x" and its account tags were not used for the Source value because they carry account handles.

## Captures used
- Current decision of each record: metal--vip.com bf84fde0, ufa350d.com adb59ac1, wingame.games 99c1bc63 (re-captures with address bars); the others are unchanged from the previous report. ufa350d.com has an earlier errored decision, which was not used. anthonyhead.com and kohochocolates.com share one capture file, as do lgbtnewsnow.org and bifestathailand.com. Every embedded file matches its recorded SHA-256.

## E2 placeholders inserted
None.

## Records whose capture is not valid (own check, no SICPADetect validation result in the dataset)
- raprnb.com: V2 (no address bar)

## Redirect lines (rule 14B)
All four are "redirect not recorded": the dataset holds no redirect chain, final URL or status code. The captured URL comes from the address bar.
- metal--vip.com: classified https://metal--vip.com/, captured https://metal--vip.com/login
- anthonyhead.com: classified https://anthonyhead.com/, captured https://kohochocolates.com
- bifestathailand.com: classified https://www.bifestathailand.com/contact.html, captured https://www.humanitiesweb.org
- lgbtnewsnow.org: classified https://lgbtnewsnow.org/, captured https://www.humanitiesweb.org
No Redirect line on kohochocolates.com, sacasino.ad, awayge.farm, ufa350d.com and wingame.games (captured URL equals the classified URL apart from case or a trailing slash) or on raprnb.com (no address bar).

## SICPADetect No became Yes under E4
None: the dataset has no SICPADetect validation result.

## Open points for review
- No capture contains a system clock. I did not treat that as a V2 failure for captures with an address bar. If required, nine of the ten fail V2.
- Seven captures show a browser update notice and, in four, a translation bar over the page header. I did not treat these as V3 overlays because the page content stays readable.
- sacasino.ad: the whole page is dimmed and carries a small notice over the top. Content stays readable, so the capture reads Yes; an analyst may decide otherwise.
- Keywords were read from the images by eye; no OCR or page source was available. The sacasino.ad blackjack menu entry is spelled differently from the lexicon entry and was not matched. On raprnb.com the banner entry for step betting is too small to read with certainty and was not matched.
- ufa350d.com is assigned Casino from its one visible Casino keyword; its page also carries a sports betting tagline and football promotions, and its Football Betting set matched nothing. wingame.games is assigned Casino (two keywords) over Slots (one), although its page shows many slot tiles.
- The record order follows the dataset's domain list.
