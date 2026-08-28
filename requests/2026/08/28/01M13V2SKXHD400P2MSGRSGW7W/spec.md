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
hr{ border:none; border-top:1px solid var(--hair); margin:16px 0; }
.note{ font-size:7.6pt; color:var(--muted); margin:4px 0 0; }
.foot{ margin-top:18px; padding-top:8px; border-top:1px solid var(--hair);
       font-size:7.2pt; color:var(--muted); }
</style>

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
| Screenshot | <span class="mono">*[YYYYMMDD_platform_handle_postID.png]*</span> |
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
| Screenshot | <span class="mono">*[ ]*</span> |
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
| Screenshot | <span class="mono">*[ ]*</span> |
| Capture (date / time / TZ) | *[ ]* |
| SHA-256 | <span class="mono">*[ ]*</span> |
| Capture valid | <span class="ok">*[ ]*</span> |

</div>

<p class="note"><strong>Fill guide.</strong> Status cell: <span class="ok">Confirmed</span> · <span class="warn">Pending</span> · <span class="off">Dismissed</span> — swap the <code>class</code> to <code>ok</code>, <code>warn</code> or <code>off</code>. Confidence badge: <code>g-a</code> ≥0.90, <code>g-b</code> 0.75–0.89, <code>g-c</code> 0.60–0.74, <code>g-d</code> 0.40–0.59, <code>g-f</code> &lt;0.40. Duplicate a record block for each additional record; the heading carries its title of classification.</p>

<p class="foot">SICPADetect · Ministry of Digital Economy and Society, Thailand · URLs are defanged for safe handling · Page size A4</p>
