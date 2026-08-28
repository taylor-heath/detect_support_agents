<!--
================================================================
AGENT INSTRUCTIONS — READ BEFORE COMPLETING THIS REPORT
================================================================
This is a fixed-format evidence template. Conform to it exactly.

1.  Fill ONLY the bracketed placeholders, e.g. *[ ]*. Replace the
    bracket with the value. Leave everything else byte-identical.

2.  Do NOT add, rename, reorder or remove fields. The field list in
    each record block is fixed and complete.

3.  Do NOT add any section, heading, preamble, commentary, summary,
    analysis, insight, recommendation, conclusion or next-steps.
    Nothing beyond the values themselves belongs in this document.

4.  Do NOT invent subcategories. Use only a subcategory that appears
    in the approved list supplied with the job. If none applies,
    write "Not available".

5.  One record block per classified URL. To add records, duplicate an
    existing block verbatim and change only the values.

6.  Where a value is unknown, unavailable or not evidenced, write
    "Not available". Do NOT infer, estimate, or derive a value from
    the domain name alone. An absent value is reported as absent.

7.  Keep every URL defanged (hxxps://example[.]com).

8.  SCREENSHOT. Embed the capture itself, not a link to it. Replace the
    placeholder in src="data:image/svg+xml..." with the capture encoded
    as a base64 data URI, e.g. src="data:image/png;base64,iVBORw0KG...".
    Keep the filename line beneath it. The report must stay a single
    self-contained file with no external image dependencies.

9.  Embed the capture exactly as taken. Do NOT crop, rescale, annotate,
    enhance, redact or otherwise alter it. The clock, URL and keyword
    must remain legible, because "Capture valid" attests to that.

10. Do NOT alter the <style> block, the empty table header rows
    (|  |  |), the <div class="record"> wrappers, or any class name.
    The empty header rows are required for the tables to parse.

11. Output must remain valid Markdown and must still fit A4.
================================================================
-->

<style>
/* ============================================================
   SICPADetect — Site Classification Report
   A4 print stylesheet. Edit values here to restyle the report.
   ============================================================ */
@page { size: A4 portrait; margin: 16mm 15mm 14mm 15mm; }

:root{
  --ink:#111417;        /* headings, body */
  --muted:#5B6670;      /* subtitles, captions */
  --rule:#111417;       /* heavy rule under section titles */
  --hair:#C9D2DB;       /* table gridlines */
  --brand-a:#C8102E;    /* confidence badge accent */
  --ok-bg:#D3E7BD;   --ok-ink:#2C5015;   /* confirmed / valid */
  --warn-bg:#FBC9AC; --warn-ink:#7A3A12; /* pending / partial */
  --off-bg:#E6EAEE;  --off-ink:#4A555F;  /* dismissed / n/a */
}

html{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }
body{
  font-family:"Helvetica Neue",Helvetica,Arial,"Noto Sans Thai",sans-serif;
  color:var(--ink); font-size:9.5pt; line-height:1.55;
  margin:0 !important; padding:0 !important; max-width:none !important;
}

/* ---- crest (top right) ---------------------------------------- */
.crest{ text-align:right; margin:0 0 2px; }
.crest img{ height:48px; width:auto; }

/* ---- section titles ------------------------------------------ */
h1{
  font-size:19pt; font-weight:800; letter-spacing:-.4px; margin:0 0 2px;
  padding-bottom:5px; border-bottom:2.5px solid var(--rule);
}
h2{
  font-size:13pt; font-weight:800; margin:22px 0 2px;
  padding-bottom:4px; border-bottom:2px solid var(--rule);
  page-break-after:avoid;
}
h3{
  font-size:10.5pt; font-weight:800; margin:16px 0 4px;
  page-break-after:avoid;
}
.sub{ font-size:8pt; font-weight:700; color:var(--muted); margin:4px 0 12px; }

/* ---- tables --------------------------------------------------- */
table{
  width:100% !important; border-collapse:collapse; margin:6px 0 4px;
  font-size:8.8pt; page-break-inside:avoid; table-layout:fixed;
  display:table !important;  /* some converters set display:block, which collapses width */
}
/* some Markdown converters inject <colgroup> percentages — neutralise them */
colgroup, col{ width:auto !important; }
/* header row is structural only — pipe tables require one, but it is not shown */
thead{ display:none; }
td{ padding:5px 8px; border:1px solid var(--hair); vertical-align:top; }
td:first-child{ width:34%; font-weight:700; }
tr{ page-break-inside:avoid; }

/* ---- status fills (UniDOC-style solid cells) ------------------ */
.ok  { background:var(--ok-bg);   color:var(--ok-ink);   font-weight:700; }
.warn{ background:var(--warn-bg); color:var(--warn-ink); font-weight:700; }
.off { background:var(--off-bg);  color:var(--off-ink);  font-weight:700; }

/* ---- confidence badge ---------------------------------------- */
.badge{
  display:inline-block; min-width:20px; padding:1px 7px; border-radius:4px;
  background:var(--brand-a); color:#fff; font-weight:800; font-size:9pt;
  text-align:center; margin-right:6px;
}
.badge.g-a{ background:#2E7D32; } .badge.g-b{ background:#7CB342; }
.badge.g-c{ background:#F9A825; } .badge.g-d{ background:#EF6C00; }
.badge.g-f{ background:var(--brand-a); }

/* ---- record blocks ------------------------------------------- */
.record{ page-break-inside:avoid; margin-bottom:4px; }
.mono{ font-family:"SF Mono",Menlo,Consolas,monospace; font-size:8.2pt; word-break:break-all; }
/* embedded screenshot — capped so a record still fits one A4 page */
.shot{ display:block; width:100%; max-width:100%; height:auto; max-height:78mm;
       object-fit:contain; border:1px solid var(--hair); margin:2px 0 4px; }
hr{ border:none; border-top:1px solid var(--hair); margin:16px 0; }
.note{ font-size:7.6pt; color:var(--muted); margin:4px 0 0; }
.foot{ margin-top:18px; padding-top:8px; border-top:1px solid var(--hair);
       font-size:7.2pt; color:var(--muted); }
</style>

<div class="crest"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAR0AAAEECAMAAAAibRAaAAAB/lBMVEWo0Kx0n192oYuTq5Xjx2L16KpbWx9ocFCGbTThvmlehDvfuT6gmGGSkjs9hWK59dc7fWExPA7Arop1wJqBb0y50nv////u7u7y9PQQWSwqWChOZzAWUxwLYTGOiE2Pl1Rwh0vXt04rVRuul0/P2M+up2wwZktudjfr5tPNuG81ZS1SdDfJpkrt149saTFPd0xuekWyt20RTC0pSxaKp5jTxo92lVWxpFbQyK1OWidVhW2Qp2avxbnWxXOom2l0mIaXtaamua8pW0NOemSJeTfW4tvHuo44dFbht0WUmGYYTBhmiXbn2q3Z1LWlhzrmyG/z5a+6y8Lx1XdWhEqTo1ni3Mrd5uGki0vkzI6Ke0ZrlHb55JRzhDqzqoh2pI26tI2OhDlLVxkoTSdHa1HY05OzlD241cXEqmuVtW3CzcaWraH489SwxHZlXCfW+ufLpT2Dm4615syUx6waXEBLZBxLSxRXlHaUi2MbY0PCnUk5cjfFvaTG9Nuss1w1YBxkWRsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACcuI4/AAAAgHRSTlP/////////////////////////////AP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8Yph7MAAEi8SURBVHja7b2HY9tGti9sO3X37t573/veE1EoAEInKRJg772FLZIsUc3q0sqW27on62STf/2dMwOwSKRMOZJs3y9IIlsTNP546m/OnLkz9+cx/bjzJwR/ovMnOn+ic9voMBeP4f/1MIwHD/h5O4Nm71M+/QISH0KH3sgzfq8bGoThhqJ1P9HTmQnwfE7oMJ64aAhaw/OloDM8bmHQbIh8NG2IWu9TPN3zMegwk+51I4M9TeA5juV4Uend/tM/Dp1b+/ZSmg3YwBHh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" alt="Ministry of Digital Economy and Society"></div>

# Site Classification Report

<p class="sub">Automated site classification — evidence record</p>

|  |  |
|---|---|
| Report reference | *[REF-YYYY-NNN]* |
| Reporting period | *[DD/MM/YYYY – DD/MM/YYYY]* |
| Prepared by | *[Name, role]* |
| Date of issue | *[DD/MM/YYYY]* |
| Document classification | <span class="warn">*[Internal / Confidential / Restricted]*</span> |
| System / model version | SICPADetect *[version]* |
| Records in this report | *[n]* |

---

## Analysis

### *[Title of classification]*

<div class="record">

|  |  |
|---|---|
| Source where URL was found | *[Platform, account, feed or search term]* |
| URL of classified site | <span class="mono">*[defanged: hxxps://example[.]com]*</span> |
| Status | <span class="ok">*[Confirmed / Pending / Dismissed]*</span> |
| Confidence | <span class="badge g-a">*[ ]*</span> *[0.00 – 1.00]* |
| Subcategory | *[e.g. Gambling → Baccarat]* |
| Keywords detected | *[keyword; keyword; keyword]* |
| Rationale | *[Model's reasoning for the classification]* |
| Screenshot | <img class="shot" src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27800%27%20height%3D%27420%27%3E%3Crect%20width%3D%27800%27%20height%3D%27420%27%20fill%3D%27%23EEF1F4%27%20stroke%3D%27%23C9D2DB%27%20stroke-width%3D%272%27%2F%3E%3Ctext%20x%3D%27400%27%20y%3D%27205%27%20font-family%3D%27Helvetica%2CArial%27%20font-size%3D%2730%27%20font-weight%3D%27bold%27%20fill%3D%27%238A96A2%27%20text-anchor%3D%27middle%27%3ESCREENSHOT%3C%2Ftext%3E%3Ctext%20x%3D%27400%27%20y%3D%27240%27%20font-family%3D%27Helvetica%2CArial%27%20font-size%3D%2719%27%20fill%3D%27%23A6B0BA%27%20text-anchor%3D%27middle%27%3Eembed%20capture%20here%3C%2Ftext%3E%3C%2Fsvg%3E" alt="Screen capture of classified site"><br><span class="mono">*[YYYYMMDD_platform_handle_postID.png]*</span> |
| Capture (date / time / TZ) | *[DD/MM/YYYY HH:MM, UTC+7]* |
| SHA-256 | <span class="mono">*[hash]*</span> |
| Capture valid | <span class="ok">*[Yes / No — clock, URL and keyword all legible]*</span> |

</div>

---

### *[Title of classification]*

<div class="record">

|  |  |
|---|---|
| Source where URL was found | *[ ]* |
| URL of classified site | <span class="mono">*[ ]*</span> |
| Status | <span class="ok">*[ ]*</span> |
| Confidence | <span class="badge g-a">*[ ]*</span> *[ ]* |
| Subcategory | *[ ]* |
| Keywords detected | *[ ]* |
| Rationale | *[ ]* |
| Screenshot | <img class="shot" src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27800%27%20height%3D%27420%27%3E%3Crect%20width%3D%27800%27%20height%3D%27420%27%20fill%3D%27%23EEF1F4%27%20stroke%3D%27%23C9D2DB%27%20stroke-width%3D%272%27%2F%3E%3Ctext%20x%3D%27400%27%20y%3D%27205%27%20font-family%3D%27Helvetica%2CArial%27%20font-size%3D%2730%27%20font-weight%3D%27bold%27%20fill%3D%27%238A96A2%27%20text-anchor%3D%27middle%27%3ESCREENSHOT%3C%2Ftext%3E%3Ctext%20x%3D%27400%27%20y%3D%27240%27%20font-family%3D%27Helvetica%2CArial%27%20font-size%3D%2719%27%20fill%3D%27%23A6B0BA%27%20text-anchor%3D%27middle%27%3Eembed%20capture%20here%3C%2Ftext%3E%3C%2Fsvg%3E" alt="Screen capture of classified site"><br><span class="mono">*[ ]*</span> |
| Capture (date / time / TZ) | *[ ]* |
| SHA-256 | <span class="mono">*[ ]*</span> |
| Capture valid | <span class="ok">*[ ]*</span> |

</div>

---

### *[Title of classification]*

<div class="record">

|  |  |
|---|---|
| Source where URL was found | *[ ]* |
| URL of classified site | <span class="mono">*[ ]*</span> |
| Status | <span class="ok">*[ ]*</span> |
| Confidence | <span class="badge g-a">*[ ]*</span> *[ ]* |
| Subcategory | *[ ]* |
| Keywords detected | *[ ]* |
| Rationale | *[ ]* |
| Screenshot | <img class="shot" src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27800%27%20height%3D%27420%27%3E%3Crect%20width%3D%27800%27%20height%3D%27420%27%20fill%3D%27%23EEF1F4%27%20stroke%3D%27%23C9D2DB%27%20stroke-width%3D%272%27%2F%3E%3Ctext%20x%3D%27400%27%20y%3D%27205%27%20font-family%3D%27Helvetica%2CArial%27%20font-size%3D%2730%27%20font-weight%3D%27bold%27%20fill%3D%27%238A96A2%27%20text-anchor%3D%27middle%27%3ESCREENSHOT%3C%2Ftext%3E%3Ctext%20x%3D%27400%27%20y%3D%27240%27%20font-family%3D%27Helvetica%2CArial%27%20font-size%3D%2719%27%20fill%3D%27%23A6B0BA%27%20text-anchor%3D%27middle%27%3Eembed%20capture%20here%3C%2Ftext%3E%3C%2Fsvg%3E" alt="Screen capture of classified site"><br><span class="mono">*[ ]*</span> |
| Capture (date / time / TZ) | *[ ]* |
| SHA-256 | <span class="mono">*[ ]*</span> |
| Capture valid | <span class="ok">*[ ]*</span> |

</div>

<p class="note"><strong>Fill guide.</strong> Status cell: <span class="ok">Confirmed</span> · <span class="warn">Pending</span> · <span class="off">Dismissed</span> — swap the <code>class</code> to <code>ok</code>, <code>warn</code> or <code>off</code>. Confidence badge: <code>g-a</code> ≥0.90, <code>g-b</code> 0.75–0.89, <code>g-c</code> 0.60–0.74, <code>g-d</code> 0.40–0.59, <code>g-f</code> &lt;0.40. Duplicate a record block for each additional record; the heading carries its title of classification.</p>

<p class="foot">SICPADetect · Ministry of Digital Economy and Society, Thailand · URLs are defanged for safe handling · Page size A4</p>
