# PROMPT — SICPADetect: Chile Summary Tables

> **How to use:** paste everything below the line into a new conversation and attach the SICPADetect export (CSV, XLSX or JSON). The export should have one row per classified record, carrying at minimum a URL or Domain, a Status, a Source, and a description / LLM reasoning field.

---

## ROLE

You are a data analyst. You are given a SICPADetect export of classified sites. Each row is one record, with at minimum: Domain, URL, Status, Source, and a description / LLM reasoning field.

## TASK

Produce exactly four tables. Nothing else except a short note on method and any data issues found.

## RULES

- Count records, not domains, unless told otherwise.
- Every table shows: count, and % rounded to 1 decimal place.
- State the denominator used for each table directly under its title.
- Include a TOTAL row in every table.
- Never estimate or infer a count. If a field is missing or a status value is unrecognised, put it in an "Unknown / blank" row rather than dropping it.
- Report separately how many records have a blank description and how many have a description saying the page could not be read (timeout, 4xx/5xx, CDN block, parked or for-sale page). Those rows cannot carry evidence, so give Table 3 a second denominator restricted to usable descriptions.
- List any row you could not classify, with its record ID.

---

## THE CHILE PROBLEM: SPANISH IS NOT A COUNTRY SIGNAL

Spanish is the working language of twenty countries. Generic Spanish gambling vocabulary (`apuestas deportivas`, `casino en línea`, `tragamonedas`, `ruleta`, `bono de bienvenida`, `giros gratis`) tells you the site is Hispanophone, not that it targets Chile. Treating it as a Chile signal will pull in Peruvian, Argentine, Mexican, Colombian and Spanish estates.

So indicators are tiered, and the tier decides whether a record qualifies.

### STRONG indicators — any one qualifies the record

| Indicator | Test |
|---|---|
| Chilean currency | `CLP`, `CLP$`, `peso chileno`, `pesos chilenos`. A bare `$` does not count; it is used across the region. |
| RUT | `RUT`, `R.U.T.`, `Rol Único Tributario`, or a RUT-formatted identifier (7–8 digits, hyphen, check digit or K). |
| Chilean payment rails | Webpay, Transbank, Redcompra, Khipu, Servipag, MACH, Chek, Tenpo, CuentaRUT, BancoEstado, Banco de Chile, Banco Falabella, Scotiabank Chile, Santander Chile, BCI. |
| Chilean phone convention | `+56` or `+569` numbers. |
| Explicit Chile reference | Chile, chileno, chilena, chilenos, or a Chilean city, region or commune: Santiago, Valparaíso, Viña del Mar, Concepción, Antofagasta, Temuco, Iquique, La Serena, Rancagua, Puerto Montt, Punta Arenas, Providencia, Las Condes, Ñuñoa, Maipú. |
| Chilean regulator or statute | Superintendencia de Casinos de Juego, SCJ, Ley 19.995, Ley de Apuestas en Línea, SII. |
| Chile-licensed or Chile-facing operators | Polla Chilena de Beneficencia, Lotería de Concepción, Teletrak, Club Hípico, Hipódromo Chile, Valparaíso Sporting, Enjoy, Dreams, Marina del Sol, Monticello, Sun Monticello. |
| Chilean football references | Colo-Colo, Universidad de Chile, Universidad Católica, La Roja, Campeonato Nacional, ANFP, Primera División de Chile. |
| Chilean localisation phrasing | `casino online Chile`, `apuestas Chile`, `casinos chilenos`, `.cl` written out in copy, `atención al cliente en Chile`. |

### WEAK indicators — never qualify a record on their own

Generic Spanish gambling and promotion vocabulary: `apuestas deportivas`, `casa de apuestas`, `casino en línea`, `casino online`, `tragamonedas`, `ruleta`, `ruleta en vivo`, `blackjack`, `póker`, `bingo`, `bono de bienvenida`, `giros gratis`, `tiradas gratis`, `rondas gratis`, `depósito mínimo`, `retiro inmediato`, `cashback`, `apuesta gratis`, `cuotas`, `en vivo`.

Record these, because they establish the site is a gambling site in Spanish, but a record qualifies as Chile-relevant only when at least one STRONG indicator is also present. Report the weak-only population separately as a spillover figure.

---

## TABLE 1 — Records by status

**Denominator:** all records in the export.

| Status | Records | % of total |
|---|---|---|
| | | |
| **TOTAL** | | 100.0% |

---

## TABLE 2 — Records by status, .cl domains only

A record counts as ".cl" if the registrable domain ends in `.cl` — including `.gob.cl`, `.gov.cl` and `.co.cl`.

Report `.gob.cl` and `.gov.cl` counts separately beneath the table; they are state domains and will distort the picture if left in silently.

**Denominator:** the .cl subset, with a second column showing share of all records.

| Status | Records | % of .cl records | % of all records |
|---|---|---|---|
| | | | |
| **TOTAL** | | 100.0% | |

---

## TABLE 3 — Records by status, Chile-target-audience indicators

A record counts if its description / reasoning field contains at least one STRONG indicator. Weak indicators alone do not qualify.

Apply this test to the **description field only**, not the URL and not the Source.

**Denominator:** the qualifying subset. Give two further percentage columns: share of all records, and share of records with a usable description.

| Status | Records | % of qualifying records | % of all records | % of usable descriptions |
|---|---|---|---|---|
| | | | | |
| **TOTAL** | | 100.0% | | |

Below the table:

- Which STRONG indicator triggered each match, grouped by indicator type, with counts.
- The weak-only spillover: records carrying Spanish gambling vocabulary but no STRONG indicator, by status. These are the regional false-positive risk.

---

## TABLE 4 — Chile relevance overall

Four independent axes. A record can satisfy more than one.

| Axis | Test |
|---|---|
| A. Domain | Registrable domain ends in `.cl` |
| B. Hostname label | `chile`, `chi`, `cl` or `scl` appears as a label or token in the hostname, on a domain that is not `.cl` (e.g. `chile.example.com`, `example-cl.net`) |
| C. Description | At least one STRONG indicator in the description field |
| D. Source | The discovery query, referrer or search term in the Source field contains a STRONG indicator or a Spanish gambling term paired with Chile |

**Denominator:** all records in the export.

| Category | Records | % of total |
|---|---|---|
| A only | | |
| B only | | |
| C only | | |
| D only | | |
| Two or more axes | | |
| **Chile-relevant overall (any axis)** | | |
| No axis | | |
| **TOTAL** | | 100.0% |

Follow it with a contribution table showing what each axis adds on its own, so the value of each test is visible:

| Axis | Records matching | Of which unique to this axis |
|---|---|---|
| A. Domain | | |
| B. Hostname label | | |
| C. Description | | |
| D. Source | | |

---

## METHOD NOTE

End with 4–6 lines covering: total records read; rows excluded and why; blank descriptions and unreachable-page descriptions with counts; which field was treated as the description; any status values that did not match an expected value; and the weak-only spillover count with a one-line comment on regional contamination risk.

---

## SETTINGS TO CONFIRM BEFORE RUNNING

| Setting | Default in this prompt | Alternative |
|---|---|---|
| Table 4 "overall" figure | Union of the four axes | Strict intersection, or domain plus description only |
| State domains | `.gob.cl` and `.gov.cl` counted, reported separately | Excluded entirely |
| Weak indicators | Never qualify alone | Qualify alone, accepting regional false positives |
| Source axis | Included as axis D | Dropped, making this a direct counterpart of the Thailand prompt |
| Unit of count | One record per row | Deduplicate to one row per registrable domain |
