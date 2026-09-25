# PROMPT — SICPADetect: Thailand Summary Tables

> **How to use:** paste everything below the line into a new conversation and attach the SICPADetect export (CSV, XLSX or JSON). The export should have one row per classified record, carrying at minimum a URL, a Status, and a description / LLM reasoning field.

---

## ROLE

You are a data analyst. You are given a SICPADetect export of classified sites. Each row is one record, with at minimum: URL, Status, and a description / LLM reasoning field.

## TASK

Produce exactly four tables. Nothing else except a short note on method and any data issues found.

## RULES

- Count records, not domains, unless told otherwise.
- Every table shows: count, and % rounded to 1 decimal place.
- State the denominator used for each table directly under its title.
- Include a TOTAL row in every table.
- Never estimate or infer a count. If a field is missing or a status value is unrecognised, put it in an "Unknown / blank" row rather than dropping it.
- List any row you could not classify, with its record ID.

---

## TABLE 1 — Records by status

**Denominator:** all records in the export.

| Status | Records | % of total |
|---|---|---|
| | | |
| **TOTAL** | | 100.0% |

---

## TABLE 2 — Records by status, .th domains only

A record counts as ".th" if the registrable domain ends in `.th` — including `.co.th`, `.go.th`, `.ac.th`, `.or.th`, `.in.th`, `.net.th`, `.mi.th`.

**Denominator:** the .th subset, with a second column showing share of all records.

| Status | Records | % of .th records | % of all records |
|---|---|---|---|
| | | | |
| **TOTAL** | | 100.0% | |

---

## TABLE 3 — Records by status, Thai-target-audience indicators

A record counts if its description / reasoning field contains one or more of:

- Thai script characters (Unicode range U+0E00–U+0E7F)
- Currency references: ฿, THB, baht, บาท
- Thai payment or banking references (e.g. PromptPay, TrueMoney, SCB, Kasikorn/KBank, Krungthai, Bangkok Bank)
- Thai contact conventions (+66 numbers, LINE ID / LINE app contact)
- Explicit reference to Thailand, Thai language, or a Thai city or province
- Thai-market gambling or product terms transliterated into Latin script (e.g. "slot pg", "baccarat th", "huay", "lottery Thai")

Apply this test to the **description field only**, not the URL.

**Denominator:** the Thai-indicator subset, with a second column showing share of all records.

| Status | Records | % of Thai-indicator records | % of all records |
|---|---|---|---|
| | | | |
| **TOTAL** | | 100.0% | |

Below the table, list which indicator triggered each match, grouped by indicator type, with counts.

---

## TABLE 4 — Thailand relevance overall

**Denominator:** all records in the export.

| Category | Records | % of total |
|---|---|---|
| .th domain only (no Thai indicator in description) | | |
| Thai indicator only (not a .th domain) | | |
| Both .th domain and Thai indicator | | |
| **Thailand-relevant overall (any of the above)** | | |
| Neither | | |
| **TOTAL** | | 100.0% |

---

## METHOD NOTE

End with 3–5 lines covering: total records read, rows excluded and why, which field was treated as the description, and any status values that did not match an expected value.

---

## SETTINGS TO CONFIRM BEFORE RUNNING

| Setting | Default in this prompt | Alternative |
|---|---|---|
| Table 4 "overall" figure | Union — .th **or** Thai indicator | Strict intersection — .th **and** Thai indicator |
| Excluded TLDs | None; `.go.th`, `.ac.th`, `.mi.th` are counted | Exclude per the MDES filter and report the excluded count separately |
| Unit of count | One record per row | Deduplicate to one row per registrable domain |
