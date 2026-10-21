# Operator summary, job 01M5F8QPD4HR7TVM092RE8MCZ8 (attempt 1)

## Values changed from the source record
- Source field: "Manual (<analyst username>)" became "SICPADetect automated classification pipeline" for metal--vip.com, 707jili.com and 9ufa.vip; the username is personal data and was removed. "Manual (claude.ai)" became the same value for suriyathai.net, anthonyhead.com, lgbtnewsnow.org, sacasino.ad and awayge.farm. Redirect seeds kept in brackets for kohochocolates.com and bifestathailand.com.
- Confidence 95 mapped to High. Timestamps converted from UTC to +07:00 (classification step, BLACKLISTED).
- Pipeline source "x" and its account tags were not used for the Source value because they carry account handles.

## Captures used
- Current decision of each record: metal--vip.com bf84fde0, 707jili.com 4090cc54, 9ufa.vip 5842e5b5 (re-captures with address bars); the others have one decision each. kohochocolates.com and anthonyhead.com share one capture file, as do lgbtnewsnow.org and bifestathailand.com. Every embedded file matches its recorded SHA-256.

## E2 placeholders inserted
None.

## Records whose capture is not valid (own check, no SICPADetect validation result in the dataset)
- suriyathai.net: V2 (no address bar)
- 707jili.com: V3 (pop-up over the page centre)
- 9ufa.vip: V3 (pop-up over the page centre)

## Redirect lines (rule 14B)
All six are "redirect not recorded": the dataset holds no redirect chain, final URL or status code. The captured URL comes from the address bar.
- metal--vip.com: classified https://metal--vip.com/, captured https://metal--vip.com/login
- anthonyhead.com: classified https://anthonyhead.com/, captured https://kohochocolates.com
- bifestathailand.com: classified https://www.bifestathailand.com/contact.html, captured https://www.humanitiesweb.org
- lgbtnewsnow.org: classified https://lgbtnewsnow.org/, captured https://www.humanitiesweb.org
- 707jili.com: classified https://707jili.com, captured https://www.707jili.com
- 9ufa.vip: classified https://www.9ufa.vip/, captured https://www.9ufa.vip/th-th/home
No Redirect line on kohochocolates.com (captured host equals classified, trailing slash only), sacasino.ad, awayge.farm or suriyathai.net (no address bar).

## SICPADetect No became Yes under E4
None: the dataset has no SICPADetect validation result.

## Open points for review
- No capture contains a system clock. I did not treat that as a V2 failure for captures with an address bar. If required, all ten fail V2.
- Eight captures show a browser update notice and, in five, a translation bar over the page header. I did not treat these as V3 overlays because the page content stays readable.
- sacasino.ad: the whole page is dimmed and carries a small notice over the top. Content stays readable, so the capture reads Yes; an analyst may decide otherwise.
- Keywords were read from the images by eye; no OCR or page source was available. The sacasino.ad menu entry for blackjack is spelled differently from the lexicon entry and was not matched.
- sacasino.ad scores Casino (five keywords) over Baccarat (one). 9ufa.vip is assigned Baccarat from its one visible Baccarat keyword; its page also shows football icons that the pop-up partly hides.
- suriyathai.net names no product, so it is General Gambling with None matched.
- The record count of 10 and their order follow the dataset's domain list.
