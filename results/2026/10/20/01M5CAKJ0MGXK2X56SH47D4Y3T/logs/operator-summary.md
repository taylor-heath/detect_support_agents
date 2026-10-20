# Operator summary, job 01M5CAKJ0MGXK2X56SH47D4Y3T (attempt 1)

## Values changed from the source record
- Source field: "Manual (claude.ai)" became "SICPADetect automated classification pipeline" for anthonyhead.com, lgbtnewsnow.org and awayge.farm.
- Source field: "Manual (<analyst username>)" became "SICPADetect automated classification pipeline" for play-tga.net, 9ufa.vip and u11k.pro. The username is personal data and was removed.
- Source field: Variant and Redirect seeds kept in brackets for 707jili.com, ktvgame88.tv, www.lardoriodao.com and www.jum88.site.
- Pipeline source "x" and its account tags exist on 4 records (anthonyhead.com, lgbtnewsnow.org, play-tga.net, awayge.farm). They were not used for the Source value because they carry account handles.
- Confidence 95 and 90 mapped to High. Timestamps converted from UTC to +07:00.

## E2 placeholders inserted
None. Every record has a screenshot, a classification timestamp and a SHA-256 hash computed from its capture file.

## Records whose capture is not valid
No SICPADetect validation result exists in the dataset, so every reason below comes from my own check of the capture file (not from the SICPADetect result).
- anthonyhead.com: V4 (screenshot URL is kohochocolates.com)
- lgbtnewsnow.org: V4 (screenshot URL is www.humanitiesweb.org)
- 707jili.com: V2 (no address bar), V3 (pop-up over the page centre)
- play-tga.net: V3 (dialog over the banner), V4 (screenshot URL is play-tga.live)
- 9ufa.vip: V3 (pop-up over most of the page)
- www.lardoriodao.com: V2 (no address bar)
- www.jum88.site: V2 (no address bar)
Valid: awayge.farm, u11k.pro (capture URL is a subdomain, noted under Capture integrity), ktvgame88.tv.

## Open points for review
- No capture contains a system clock. I did not treat that as a V2 failure, because SICPADetect captures are browser viewport images. If the clock is required, all ten captures fail V2.
- V4 was applied to a different registrable domain only. Subdomain and path redirects (play1.u11k.pro, /th-th/home) were not treated as mismatches.
- Subcategory for u11k.pro is Football Betting (sports betting branding, record tags start with betting). No Football Betting keyword is visible in the capture, so Keywords detected reads None matched.
- Keywords were read from the capture images by eye. No OCR tool was available.
