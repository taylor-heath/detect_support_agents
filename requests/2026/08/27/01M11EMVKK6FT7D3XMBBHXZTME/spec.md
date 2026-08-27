# SICPADetect — Site Classification Report

For each item in the dataset create a separate report.

**Report title:** *[Insert report title]*

| Field | Value |
|---|---|
| Report reference | *[REF-YYYY-NNN]* |
| Reporting period | *[DD/MM/YYYY – DD/MM/YYYY]* |
| Prepared by | *[Name, role]* |
| Reviewed by | *[Name, role]* |
| Date of issue | *[DD/MM/YYYY]* |
| Classification of this document | *[Internal / Confidential / Restricted]* |
| Detection system | SICPADetect |
| System / model version | *[version]* |
| Total records in this report | *[n]* |

---


## 2. Methodology and evidence rules

### 2.1 Mandatory elements of every capture

| # | Requirement | Why it matters | Pass / Fail |
|---|---|---|---|
| 1 | Operating-system date and time visible in the same frame as the post | Fixes the capture to a point in time; in-post relative timestamps are not acceptable | *[ ]* |
| 2 | Full URL legible in the browser address bar, pointing to the individual post or page | Identifies the exact resource, not a feed or profile | *[ ]* |
| 3 | Category keyword readable (e.g. baccarat, casino, slots) | Evidences the basis of the classification | *[ ]* |
| 4 | Account display name and handle both visible | Identifies the publisher | *[ ]* |
| 5 | Full post content, offers, sign-up links and attached images captured | Preserves the substance of the advertisement | *[ ]* |

### 2.2 Capture method

| # | Rule |
|---|---|
| 6 | Full-screen capture only — no cropped windows or region selections |
| 7 | No editing, annotation, redaction or resizing of the original file |
| 8 | Native resolution; PNG or other lossless format; text legible without interpolation |
| 9 | Clean browser profile — not logged in, no extensions, no zoom or theme altering layout |
| 10 | No clicking promotional links, registering, depositing or contacting the advertiser without separate authorisation |
| 11 | Content longer than one screen captured in sequential overlapping frames |

### 2.3 Handling the target account

| # | Rule |
|---|---|
| 12 | Profile page captured separately from the individual post (bio, links, follower count, join date) |
| 13 | Numeric post ID recorded as a separate text field so it survives deletion or handle change |
| 14 | Both the shortened link and its resolved destination recorded where a redirect is used |

### 2.4 Filing and integrity

| # | Rule |
|---|---|
| 15 | File naming convention: `YYYYMMDD_platform_handle_postID.png` |
| 16 | Capture log records date, time, timezone, operator, device and the route or search term used |
| 17 | SHA-256 hash generated at time of capture and stored in the log |
| 18 | Originals held in write-protected storage; all work performed on copies |
| 19 | Retention in line with organisational evidence policy, assuming possible legal or regulatory challenge |

### 2.5 Conditions that void a capture

| # | Failure |
|---|---|
| A | Clock cut off or window not maximised |
| B | URL truncated by a narrow browser window |
| C | Keyword present only in an image too small to read |
| D | Captured from a mobile app with no address bar |
| E | Screen recording used in place of a still, with no timestamped frame |

---

## 4. Detailed classification records

> One block per record. Duplicate the block for each additional entry.

### Record 001

| Field | Value |
|---|---|
| 1. Title of classification | *[Classification title as assigned]* |
| 2. Source where URL was found | *[Platform, account, feed, search term or referral]* |
| 3. URL of classified site | *[Full URL as it appeared in the address bar]* |
| 4. Status assigned by system | *[Confirmed / Pending / Dismissed]* |
| 5. Confidence level | *[0.00 – 1.00]* |
| 6. Subcategory / classification | *[e.g. Gambling → Baccarat]* |
| 7. LLM reasoning output | *[See breakdown below]* |
| 8. Screenshot | *[Filename / Appendix reference]* |

**7. LLM reasoning breakdown**

| Element | Output |
|---|---|
| Keywords detected | *[keyword; keyword; keyword]* |
| Subclassifications | *[primary; secondary]* |
| Rationale | *[Model's stated reasoning for the classification]* |
| Contradicting signals | *[Anything the model weighed against the classification]* |
| Reviewer agreement | *[Agree / Disagree / Amended — with reason]* |

**Evidence integrity**

| Field | Value |
|---|---|
| Screenshot filename | *[YYYYMMDD_platform_handle_postID.png]* |
| Capture date and time | *[DD/MM/YYYY HH:MM]* |
| Timezone | *[e.g. ICT / UTC+7]* |
| Operator | *[Name]* |
| Device / OS / browser | *[e.g. Raspberry Pi OS, Chromium]* |
| Post ID | *[numeric ID]* |
| Short link | *[t.co/... or n/a]* |
| Resolved destination | *[full URL or n/a]* |
| SHA-256 hash | *[hash]* |
| Rules 1–5 satisfied | *[Yes / No — if no, state which]* |
| Capture valid | *[Yes / No]* |

---

### Record 002

| Field | Value |
|---|---|
| 1. Title of classification | *[ ]* |
| 2. Source where URL was found | *[ ]* |
| 3. URL of classified site | *[ ]* |
| 4. Status assigned by system | *[ ]* |
| 5. Confidence level | *[ ]* |
| 6. Subcategory / classification | *[ ]* |
| 7. LLM reasoning output | *[See breakdown below]* |
| 8. Screenshot | *[ ]* |

**7. LLM reasoning breakdown**

| Element | Output |
|---|---|
| Keywords detected | *[ ]* |
| Subclassifications | *[ ]* |
| Rationale | *[ ]* |
| Contradicting signals | *[ ]* |
| Reviewer agreement | *[ ]* |

**Evidence integrity**

| Field | Value |
|---|---|
| Screenshot filename | *[ ]* |
| Capture date and time | *[ ]* |
| Timezone | *[ ]* |
| Operator | *[ ]* |
| Device / OS / browser | *[ ]* |
| Post ID | *[ ]* |
| Short link | *[ ]* |
| Resolved destination | *[ ]* |
| SHA-256 hash | *[ ]* |
| Rules 1–5 satisfied | *[ ]* |
| Capture valid | *[ ]* |

---

## 5. Screenshot evidence log

| Record | Screenshot file | Captured (date / time / TZ) | Operator | SHA-256 | Rules 1–5 | Valid |
|---|---|---|---|---|---|---|
| 001 | *[ ]* | *[ ]* | *[ ]* | *[ ]* | *[ ]* | *[ ]* |
| 002 | *[ ]* | *[ ]* | *[ ]* | *[ ]* | *[ ]* | *[ ]* |
| 003 | *[ ]* | *[ ]* | *[ ]* | *[ ]* | *[ ]* | *[ ]* |

**Voided captures**

| Record | Screenshot file | Failure code (A–E) | Action taken | Re-captured |
|---|---|---|---|---|
| *[ ]* | *[ ]* | *[ ]* | *[ ]* | *[ ]* |

---

## 6. Conclusion

| Item | Statement |
|---|---|
| Overall finding | *[ ]* |
| Confidence in the dataset | *[ ]* |
| Evidence integrity assessment | *[All captures compliant / n exceptions, see §5]* |
| System performance observations | *[False-positive rate, drift, keyword gaps]* |
| Risks and caveats | *[ ]* |
| Recommendation 1 | *[Action — owner — target date]* |
| Recommendation 2 | *[Action — owner — target date]* |
| Recommendation 3 | *[Action — owner — target date]* |
| Next reporting cycle | *[DD/MM/YYYY]* |

---

## 7. References

| # | Reference | Type | Date accessed |
|---|---|---|---|
| R1 | *[Regulation, policy or standard]* | *[Legal / Policy]* | *[ ]* |
| R2 | *[SICPADetect model documentation]* | *[Technical]* | *[ ]* |
| R3 | *[Internal evidence-handling SOP]* | *[Procedure]* | *[ ]* |

---

## 8. Appendices

| Appendix | Content | Location |
|---|---|---|
| A | Full screenshot set | *[path / archive name]* |
| B | Raw SICPADetect export (CSV / JSON) | *[filename]* |
| C | Hash manifest | *[filename]* |
| D | Keyword and subcategory taxonomy | *[filename]* |
| E | Capture SOP (source document) | *[filename]* |
| F | Change log for this report | *[below]* |
