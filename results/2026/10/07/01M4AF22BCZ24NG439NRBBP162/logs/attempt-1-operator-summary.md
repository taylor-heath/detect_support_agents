# Operator summary — job 01M4AF22BCZ24NG439NRBBP162

Required by spec.md rule 21. This summary is not part of the report.

Report: `assets/01M4AF22BCZ24NG439NRBBP162/report.docx`
Dataset: 10 URL records, `dataset.json.gz` (sha256 verified against `request.json`).
Captures: 10 PNG evidence files, all 10 sha256 values verified against
`request.json`; the 9 used are embedded in the report byte-identical to source.

## 1. Record selection

Rule 16 admits only Confirmed records. Nine of the ten dataset records carry
`currentStatus = BLACKLISTED` with `caseManagement.currentState =
ILLEGAL_GAMBLING`, read as Confirmed. One does not:

| URL | currentStatus | classification | confidence |
|---|---|---|---|
| www.9ufa.vip | REVIEW_NEEDED | REQUIRE_MORE_ANALYSIS | 30 |

That record is excluded from the report. Under rule 5 the tenth block is
filled with `[NEW RECORD REQUIRED]` in its heading and every value field, and
"Records in this report" still reads 10.

## 2. Values changed from the source record

### 2.1 Source field, rule 11 (applies to 5 records)

`decisions[].initialAuthor` is rewritten as the "Source where URL was found"
value. "Manual" and "claude.ai" are removed. Where nothing remains, the
rule's fallback string is used.

| Record | Source record value | Written as |
|---|---|---|
| suriyathai.net | Manual (claude.ai) | SICPADetect automated classification pipeline |
| 707jili.com | Variant (707jili.vip) | SICPADetect (Variant: 707jili.vip) |
| play-tga.net | Manual (claude.ai) | SICPADetect automated classification pipeline |
| dreamworld777.buzz | Manual (claude.ai) | SICPADetect automated classification pipeline |
| e699zz.com | Manual (claude.ai) | SICPADetect automated classification pipeline |
| jun8891.com | Variant (jun8888.info) | SICPADetect (Variant: jun8888.info) |
| meetang.cc | Manual (claude.ai) | SICPADetect automated classification pipeline |
| mun8.com | Variant (mun89.com) | SICPADetect (Variant: mun89.com) |
| mst88.work | Redirect (mst88.site) | SICPADetect (Redirect: mst88.site) |

No instance of "Manual", "claude.ai" or any third-party tool name remains
anywhere in the report. This was checked programmatically over the rendered
document text.

### 2.2 Confidence, rule 12 (all 9 records)

Every record carries `confidencePercent = 95`. Written as the badge value
"High" with badge class g-a. No numeric score appears in the report.

### 2.3 Capture timestamp, rule 8 (all 9 records)

Taken from the classification step for that URL, the history entry at which
`ANALYSIS_DONE` and the terminal status were recorded. The recorded value is
UTC. It is written as the same instant expressed with the +07:00 offset, which
is the offset the template shows. Fractional seconds are carried through
exactly as recorded and are not padded or truncated.

| Record | Recorded (UTC) | Written |
|---|---|---|
| suriyathai.net | 2026-09-26T03:51:53.702663Z | 2026-09-26T10:51:53.702663+07:00 |
| 707jili.com | 2026-10-03T13:22:18.268Z | 2026-10-03T20:22:18.268+07:00 |
| play-tga.net | 2026-10-03T04:14:35.026059Z | 2026-10-03T11:14:35.026059+07:00 |
| dreamworld777.buzz | 2026-10-05T03:48:21.305467Z | 2026-10-05T10:48:21.305467+07:00 |
| e699zz.com | 2026-09-30T04:18:37.761429Z | 2026-09-30T11:18:37.761429+07:00 |
| jun8891.com | 2026-09-25T17:22:26.688453Z | 2026-09-26T00:22:26.688453+07:00 |
| meetang.cc | 2026-10-03T04:13:23.534502Z | 2026-10-03T11:13:23.534502+07:00 |
| mun8.com | 2026-09-24T14:56:07.775865Z | 2026-09-24T21:56:07.775865+07:00 |
| mst88.work | 2026-10-04T03:37:28.372771Z | 2026-10-04T10:37:28.372771+07:00 |

### 2.4 Screenshot filename line (all 9 records)

The template shows the pattern `YYYYMMDD_platform_handle_postID.png`. No
capture in this dataset carries a filename in that form. The evidence file is
identified by its recorded path, `evidence/<domainId>/<decisionId>/homepage`,
and that path is written in the filename line rather than a constructed name.

### 2.5 Subcategory assignment (rule 4)

Appendix A.1 permits seven values and gives no scoring method, so the rule
applied here is stated for the record:

1. Take the product subcategory named first by the SICPADetect record's own
   `currentDetails.tags`, where that tag maps to an A.1 product subcategory
   (slots to Slots, casino to Casino, poker to Playing card, betting to
   Football Betting), and confirm it with a verbatim A.1 keyword match in the
   capture.
2. Where the record's tags name no A.1 product subcategory, or the mapped one
   has no verbatim keyword match, assign the subcategory with the most
   verbatim A.1 matches in the capture.
3. Where no product subcategory matches, assign General Gambling as the
   catch-all.

| Record | tags | Assigned | Route |
|---|---|---|---|
| suriyathai.net | betting | General Gambling | 3, no product keyword matched |
| 707jili.com | slots, casino | Slots | 1 |
| play-tga.net | slots, casino, betting | Slots | 1 |
| dreamworld777.buzz | slots, casino | Slots | 1 |
| e699zz.com | betting, wagering | Casino | 2, no football keyword matched |
| jun8891.com | betting, casino, poker | Casino | 1, betting had no keyword match |
| meetang.cc | slots, casino | Slots | 1 |
| mun8.com | slots, jackpot, casino | Slots | 1 |
| mst88.work | slots, casino | Slots | 1 |

### 2.6 Keyword evidence (rule 13) — evidence available

Rule 13 names four evidence sources: page text, page source, OCR output of
the screenshot, and Thai text visible in the screenshot. Only the fourth was
available. Each decision carries a second document, `homepage-html`, but the
dataset records it as `included: false, omitted: "not-an-image"`, so no page
text or page source was delivered with the request. Keywords were therefore
read from the Thai text visible in the capture, under the A.3 matching rules.

| Record | Subcategory | Keywords detected |
|---|---|---|
| suriyathai.net | General Gambling | None matched |
| 707jili.com | Slots | สล็อต; สล็อตเว็บตรง |
| play-tga.net | Slots | สล็อต |
| dreamworld777.buzz | Slots | สล็อต |
| e699zz.com | Casino | คาสิโน; คาสิโนสด |
| jun8891.com | Casino | คาสิโน; คาสิโนสด |
| meetang.cc | Slots | สล็อต |
| mun8.com | Slots | สล็อต |
| mst88.work | Slots | สล็อต |

Keywords from other subcategories, and A.2 signal-tag keywords, were found in
several captures and are not listed, as rule 13 requires. If the page text and
page source are delivered on a re-run, these lists will grow.

### 2.7 Rationale labels (rule 17)

The "Domain / URL evidence" label and its separator are deleted in the three
records whose domain and path carry no gambling term: suriyathai.net,
play-tga.net, meetang.cc. The "Capture integrity" label is present only where
the capture needs a note (an overlay covering the page, a sign-in wall, or an
install prompt) and is deleted in dreamworld777.buzz, meetang.cc and
mst88.work.

### 2.8 Report reference, rule 7

The template field "Report reference" expects the pattern REF-YYYY-NNN. No
such value exists in the request or in any source record. It is written as
"Not available" under rule 7 rather than constructed. See item 3 below.

### 2.9 Record title headings

The template heading is "Title of classification". Each is written as the
classified domain followed by its assigned subcategory, for example
"707jili.com: Slots". No title exists in the source records.

## 3. E2 placeholders inserted

| Where | Placeholder | Data needed |
|---|---|---|
| Record block 10, heading and every value field | [NEW RECORD REQUIRED] | One further Confirmed record. The dataset supplies nine. The tenth dataset record, www.9ufa.vip, is REVIEW_NEEDED with confidence 30 and classification REQUIRE_MORE_ANALYSIS, so it is not admissible under rule 16. Either promote that record to Confirmed or supply a tenth Confirmed record, then re-run. |

No [NEW CAPTURE REQUIRED] placeholder was needed. All nine admitted records
carry a capture file, a capture timestamp and a SHA-256 evidence hash.

## 4. Items for the maintainer

1. **Report reference is blank.** "Not available" is correct under rule 7 but
   is likely not what MDES expects on a submission. If the reference is meant
   to be issued by the Web App, add it to `params` and the field will fill.
2. **Page text and page source were not delivered.** The `homepage-html`
   document is omitted as "not-an-image". Keyword coverage is limited to what
   is visible in the screenshot. Including the page text would make rule 13
   fully satisfiable.
3. **Subcategory scoring is not specified.** Appendix A.1 permits one value
   per record but the spec gives no tie-break where several product
   subcategories score. The rule used is written out at 2.5. If SICPADetect
   already computes a subcategory, passing it through would remove the
   ambiguity.
4. **Asset storage is plain git, not LFS.** The agent brief prefers Git LFS
   for .docx assets. This repository has no LFS configuration, every existing
   asset is a plain git blob, and enabling LFS would mean writing a
   `.gitattributes` at the repository root, which the brief forbids
   (writes are confined to `claims/`, `results/` and `assets/`). The report is
   committed as a plain blob at 11.3 MB, within the 25 MB per-asset limit, and
   `storage.kind` reads "git", matching every prior result in this repository.
   Scoping LFS to `assets/.gitattributes` is possible if LFS is provisioned.
5. **One on-page clock disagrees with the record.** The e699zz.com capture
   renders a site clock reading 2026/09/30 04:18:18am (GMT8). The
   classification step for that URL is recorded at 2026-09-30T04:18:37Z. The
   on-page clock is a page element, not the capture timestamp, and the record
   says so under Capture integrity. Worth confirming which the capture
   pipeline intends to be authoritative.
6. **No page numbers or running header.** The template adds none, rule 3
   forbids adding anything beyond the values, and the stylesheet comment
   treats print headers and footers as browser-injected rather than part of
   the document. The .docx follows the template.
