# Operator summary, job 01M5M94611HMPN31T225AF80SH (attempt 1)

Source value: taken from the author field of the current decision step (`currentStep.author`) in dataset.json.gz only. Author `System` is written as SICPADetect automated classification pipeline (no source metadata remains); `Redirect (x)` is written as SICPADetect (Redirect: x). The initial author (Manual) is not used.

Capture time: the classification step `insertedAt` (UTC) converted to +07:00 with whole seconds. Reports no SICPADetect validation result exists in the dataset, so Capture valid was judged from the capture files under checks V1 to V6.

Record selection: all 10 domains are BLACKLISTED with case management state ILLEGAL_GAMBLING, read as Confirmed. The current decision of each record was used (for ufa350d.com, wingame.games and raprnb.com the earlier decisions were not used).

## E2 placeholders
None inserted. Report reference was not supplied and reads Not available.

## Judgement calls to confirm
- Clock: the captures are browser viewport screenshots with no system clock in frame; check V2 was applied to the URL and keywords only.
- sacasino.ad: the page is dimmed by an overlay but its content is legible; read as valid under V3.
- Subcategory: set from the SICPADetect record tags and the visible content, keywords from Appendix A.1 read by eye from the captures (no OCR tool available), so Thai keywords should be spot checked.
- No `homepage-html` page text was included in the dataset, so keywords come from the screenshots only.
- The capture file has no extension; the filename line reads `homepage`.

## Per record

### metal--vip.com
- Capture file: homepage, 2,710,236 bytes, embedded SHA-256 matches the Image hash: yes
- Image hash: 12a20fa30b07b188f8e2cb126dc5ab5a71d234eef2f14cd9990c52cd99e48f94
- Record hash: 090845076d0bf6bb687f00598da356c1d3beeba4896c576999dda5e4b632c22c
- Hashed text: `12a20fa30b07b188f8e2cb126dc5ab5a71d234eef2f14cd9990c52cd99e48f94|https://metal--vip.com/|2026-10-21T18:56:25+07:00`
- Source written: SICPADetect automated classification pipeline (author: System)
- Subcategory: Slots; keywords: None matched

- Redirect line: classified https://metal--vip.com/, captured https://metal--vip.com/login, form: redirect not recorded in the record (flag for analyst)

### anthonyhead.com
- Capture file: homepage, 2,229,668 bytes, embedded SHA-256 matches the Image hash: yes
- Image hash: 536152df08971c1271fb8c4252b8a1993540d51faba793664632ba44090e45f1
- Record hash: 36d9947112375da6d1b0eddf59f501f7f43a465efc96d88f24aa4f4776983205
- Hashed text: `536152df08971c1271fb8c4252b8a1993540d51faba793664632ba44090e45f1|https://anthonyhead.com/|2026-10-12T11:28:26+07:00`
- Source written: SICPADetect automated classification pipeline (author: System)
- Subcategory: Slots; keywords: สล็อต; สล็อตเว็บตรง

- Redirect line: classified https://anthonyhead.com/, captured https://kohochocolates.com, form: redirect not recorded in the record (flag for analyst)

### kohochocolates.com
- Capture file: homepage, 2,229,668 bytes, embedded SHA-256 matches the Image hash: yes
- Image hash: 536152df08971c1271fb8c4252b8a1993540d51faba793664632ba44090e45f1
- Record hash: eed4a41225b79b5eb293d2410f196c6e5680fe50ac77c8b8f21204eddac58db1
- Hashed text: `536152df08971c1271fb8c4252b8a1993540d51faba793664632ba44090e45f1|https://kohochocolates.com/|2026-10-12T11:28:43+07:00`
- Source written: SICPADetect (Redirect: anthonyhead.com) (author: Redirect (anthonyhead.com))
- Subcategory: Slots; keywords: สล็อต; สล็อตเว็บตรง

### bifestathailand.com
- Capture file: homepage, 2,184,895 bytes, embedded SHA-256 matches the Image hash: yes
- Image hash: 74d6b6ed66cc81118dc44fc694ddd8df6c3a138e419a92ccd58bf53fb7bf9a9c
- Record hash: 180765e4e44ea9ff4863f0aa8db68d7aee4193624e584525ac06ccede9982eca
- Hashed text: `74d6b6ed66cc81118dc44fc694ddd8df6c3a138e419a92ccd58bf53fb7bf9a9c|https://www.bifestathailand.com/contact.html|2026-10-12T11:28:26+07:00`
- Source written: SICPADetect (Redirect: lgbtnewsnow.org) (author: Redirect (lgbtnewsnow.org))
- Subcategory: Slots; keywords: สล็อต; เล่นสล็อต

- Redirect line: classified https://www.bifestathailand.com/contact.html, captured https://www.humanitiesweb.org, form: redirect not recorded in the record (flag for analyst)

### lgbtnewsnow.org
- Capture file: homepage, 2,184,895 bytes, embedded SHA-256 matches the Image hash: yes
- Image hash: 74d6b6ed66cc81118dc44fc694ddd8df6c3a138e419a92ccd58bf53fb7bf9a9c
- Record hash: 0343e4fb7b0088127743e52efd77cfaef04f0402d80410b4b7818497c919a3a3
- Hashed text: `74d6b6ed66cc81118dc44fc694ddd8df6c3a138e419a92ccd58bf53fb7bf9a9c|https://lgbtnewsnow.org/|2026-10-12T11:28:11+07:00`
- Source written: SICPADetect automated classification pipeline (author: System)
- Subcategory: Slots; keywords: สล็อต; เล่นสล็อต

- Redirect line: classified https://lgbtnewsnow.org/, captured https://www.humanitiesweb.org, form: redirect not recorded in the record (flag for analyst)

### sacasino.ad
- Capture file: homepage, 782,351 bytes, embedded SHA-256 matches the Image hash: yes
- Image hash: 881f26861101783f0d148c349c6e3a7a72b52e5ce9bb87fe7b533f6eee517b1a
- Record hash: 621ecc9eb2229de093cb7253bc8bd5fa1bc850c1e694a72cd320d6986dbf52c3
- Hashed text: `881f26861101783f0d148c349c6e3a7a72b52e5ce9bb87fe7b533f6eee517b1a|https://sacasino.ad/|2026-10-11T11:30:51+07:00`
- Source written: SICPADetect automated classification pipeline (author: System)
- Subcategory: Casino; keywords: คาสิโน; คาสิโนออนไลน์; เสือมังกร; รูเล็ต; ไฮโล

### awayge.farm
- Capture file: homepage, 2,679,697 bytes, embedded SHA-256 matches the Image hash: yes
- Image hash: 21b7f3a82f29bb9e7ac38f43b05a6fdeed7f8a328003ebed258cb995295ed6e9
- Record hash: 91a0317221d10b980f0e13152f7eeb634ff50752b8ca02e1b0fcca65c36d4c0b
- Hashed text: `21b7f3a82f29bb9e7ac38f43b05a6fdeed7f8a328003ebed258cb995295ed6e9|https://awayge.farm/|2026-10-11T11:33:10+07:00`
- Source written: SICPADetect automated classification pipeline (author: System)
- Subcategory: Slots; keywords: สล็อต

### ufa350d.com
- Capture file: homepage, 1,738,002 bytes, embedded SHA-256 matches the Image hash: yes
- Image hash: d57cb2c4153036733d3716fff874a8e2094bba189106a6daf4f68edd6c514947
- Record hash: 8c05d73e350013a4b0a80d597cda298e91c594d0a47136df5835ad835b55362c
- Hashed text: `d57cb2c4153036733d3716fff874a8e2094bba189106a6daf4f68edd6c514947|https://www.ufa350d.com|2026-10-21T20:20:21+07:00`
- Source written: SICPADetect automated classification pipeline (author: System)
- Subcategory: Football Betting; keywords: None matched

### wingame.games
- Capture file: homepage, 2,299,281 bytes, embedded SHA-256 matches the Image hash: yes
- Image hash: 139057cf69020b24060a8af05c323588618203d3a4064c34e01254f541604ff5
- Record hash: cf95fb7601780026c22bdb270d46c6b6aaa1623efac9e27876f0ec0838e3c3e3
- Hashed text: `139057cf69020b24060a8af05c323588618203d3a4064c34e01254f541604ff5|https://wingame.games|2026-10-21T20:22:21+07:00`
- Source written: SICPADetect automated classification pipeline (author: System)
- Subcategory: Slots; keywords: สล็อต

### raprnb.com
- Capture file: homepage, 1,118,440 bytes, embedded SHA-256 matches the Image hash: yes
- Image hash: 770876d5a73f845700677418b49179d7ffa692463ccb2a5313f3a39a1b57ff18
- Record hash: 4a148e8af7d36a161c915208e67e504f696ce9fef0ca48b7ef62fa8a87b83cf7
- Hashed text: `770876d5a73f845700677418b49179d7ffa692463ccb2a5313f3a39a1b57ff18|https://raprnb.com|2026-10-22T15:21:28+07:00`
- Source written: SICPADetect automated classification pipeline (author: System)
- Subcategory: Football Betting; keywords: แทงบอล; แทงบอลออนไลน์; บอลออนไลน์

- Redirect line: classified https://raprnb.com, captured https://kosova.org, form: redirect not recorded in the record (flag for analyst)


## Capture validity
All 10 captures read Yes. No SICPADetect No was changed to Yes under E4.
