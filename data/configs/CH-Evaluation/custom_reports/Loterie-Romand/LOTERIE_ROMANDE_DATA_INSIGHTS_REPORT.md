<!-- ============================================================= -->
<!--  OFFICIAL REPORT SPECIFICATION — DO NOT DISTRIBUTE EXTERNALLY  -->
<!-- ============================================================= -->

# ┌─────────────────────────────────────────────────────────────┐
# │  EVALUATION OF CH ONLINE GAMBLING ENVIRONMENT                │
# └─────────────────────────────────────────────────────────────┘

|  |  |
|---|---|
| **Client** | **Loterie Romande** |
| **Report purpose** | **Evaluation of CH Online Gambling Environment** |
| **Produced by** | **SICPA SA** |
| **Date of emission** | **7 August 2026** |
| **Document type** | Data Insights & Patterns — report specification |
| **Source pipeline** | SICPADetect spreadsheet export |

---

> This document specifies the **Data Insights & Patterns** report as delivered to
> Loterie Romande. It is derived from the base specification
> (`DATA_INSIGHTS_REPORT_INSTRUCTIONS.md`) with the client-specific adjustments set
> out in Part II, Part III and Part IV. Where this document is silent, the base
> specification governs. The report remains fully **data-driven**: never invent a
> value — if the input does not contain it, leave it blank or omit the section.

---

# PART I — LICENSING REGIME (REFERENCE DATA)

Switzerland runs a **closed licensing system** under the Money Gaming Act
(Geldspielgesetz / BGS, in force since 1 January 2019). Two regulators oversee two
separate markets:

- **ESBK** (Eidgenössische Spielbankenkommission / Federal Gaming Board) — online
  casino games
- **Gespa** (Interkantonale Geldspielaufsicht) — lotteries and sports betting

Everything not on these lists is unlicensed; foreign sites are DNS-blocked and
published on regulator blocklists.

> **Verification:** The authoritative, current list of licensed online casinos is
> published by the ESBK at <https://www.esbk.admin.ch/de/online-spielbanken> (note:
> published as an image). To check any site, search the provider name there — if
> it's absent, it's not licensed. Legitimate Swiss operators use a `.ch` domain and
> publish their physical casino address on the site.

## Gespa-supervised — Lotteries & Sports Betting

A two-operator monopoly split by language region. Only two non-casino sports-betting
concessions exist for the entire country.

| Operator | URL | Brands | Region |
|----------|-----|--------|--------|
| Swisslos | <https://www.swisslos.ch> | Swiss Lotto, EuroMillions, **Sporttip** (sports betting), Jass, scratch/online tickets | German-speaking cantons + Ticino |
| Loterie Romande | <https://www.loro.ch> | **JouezSport** (sports betting), PMU (horse racing), EuroMillions, Swiss Loto, LotoExpress, Tribolo, scratch tickets | French-speaking cantons |

## ESBK-licensed — Online Casinos

Each brand is the online arm of a licensed Swiss land-based casino. Land-based
operator shown only where sources agree; blank = varies by source / verify on the
ESBK page.

| Brand | URL | Land-based operator | Notes |
|-------|-----|---------------------|-------|
| jackpots.ch | <https://www.jackpots.ch> | — | Switzerland's first legal online casino |
| mycasino.ch | <https://www.mycasino.ch> | Grand Casino Luzern | Among the largest Swiss online casinos |
| casino777.ch | <https://www.casino777.ch> | — | |
| starvegas.ch | <https://www.starvegas.ch> | — | |
| 7melons.ch | <https://www.7melons.ch> | — | |
| swiss4win.ch | <https://www.swiss4win.ch> | — | |
| pasino.ch | <https://www.pasino.ch> | Partouche group (Casino du Lac) | |
| swisscasinos.ch | <https://online.swisscasinos.ch> | Swiss Casinos | |
| admiral.ch | <https://www.admiral.ch> | Casino Mendrisio (Novomatic) | Entered market 2025 |
| hurrahcasino.ch | <https://www.hurrahcasino.ch> | — | Newer brand — verify on ESBK list |
| goldengrand.ch | <https://www.goldengrand.ch> | — | Newer brand — verify on ESBK list |
| gamrfirst.ch | <https://www.gamrfirst.ch> | — | Newer brand — verify on ESBK list |
| casineo.ch | <https://www.casineo.ch> | — | Newer brand — verify on ESBK list |

> The roster changes as casinos launch or close. The tables above are the
> **reference whitelist** the report uses (a) to classify licensed sites (Part II)
> and (b) to supply the **brand tokens** for variation detection (Part III §3.14).
> They must be reconciled against the official ESBK/Gespa pages before each run.

---

# PART II — CATEGORISATION MODEL

For Loterie Romande, a gambling site is resolved into **one of three categories**.
Each category has a **code** (for data categorisation) and a **display label** (for
any rendered surface):

| Code | Display label | Meaning |
|------|---------------|---------|
| `ILLEGAL_GAMBLING` | Illegal Gambling Site | Gambling offer with no Swiss authorisation |
| `ESBK_LICENSED` | Licensed by ESBK | Online casino licensed by the ESBK (Part I list) |
| `GESPA_SUPERVISED` | Supervised by GESPA | Lottery / sports-betting operator supervised by Gespa (Part I list) |

Two further non-gambling statuses are retained from the base spec:

| Code | Display label | Meaning |
|------|---------------|---------|
| `NON_GAMBLING` | Not Gambling | Site is not a gambling offer |
| `UNREACHABLE` | Unreachable | Site could not be reached at evaluation time |

`Review needed` rows are dropped from the working set (see Part III §2) and never
categorised.

## 2.1 How a row is categorised

The input `Status` column drives categorisation; the **Part I whitelist** splits
licensed rows into ESBK vs GESPA:

```
registrable(row) = eTLD+1 of Domain (else of URL), lower-cased
                   e.g. "www.loro.ch/jouezsport" -> "loro.ch"

GESPA_DOMAINS = { swisslos.ch, loro.ch }          # from Part I, incl. brand hosts
ESBK_DOMAINS  = { jackpots.ch, mycasino.ch, casino777.ch, starvegas.ch,
                  7melons.ch, swiss4win.ch, pasino.ch, swisscasinos.ch,
                  admiral.ch, hurrahcasino.ch, goldengrand.ch, gamrfirst.ch,
                  casineo.ch }

category(row):
    if Status == 'Illegal gambling'      -> ILLEGAL_GAMBLING
    elif Status == 'Licensed gambling':
        if registrable(row) in GESPA_DOMAINS -> GESPA_SUPERVISED
        elif registrable(row) in ESBK_DOMAINS -> ESBK_LICENSED
        else                              -> ESBK_LICENSED     # see rule below
    elif Status == 'Not gambling'         -> NON_GAMBLING
    elif Status == 'Unreachable'          -> UNREACHABLE
    else                                  -> UNKNOWN
```

**Default-to-ESBK rule.** Gespa is a closed **two-operator** set (Swisslos, Loterie
Romande). Any row that is licensed but does not match `GESPA_DOMAINS` is therefore an
ESBK casino and is categorised `ESBK_LICENSED`. If a licensed row matches neither
list *and* is not a `.ch` domain, flag it in the run log as `LICENSED_UNMATCHED` for
manual review, but still count it under `ESBK_LICENSED` in totals so no licensed site
is silently dropped.

**Derived flags** (replace the base spec's `isLicensed`):
`isIllegal = category == ILLEGAL_GAMBLING`;
`isEsbk = category == ESBK_LICENSED`;
`isGespa = category == GESPA_SUPERVISED`;
`isGambling = isIllegal or isEsbk or isGespa`.

---

# PART III — REPORT GENERATION SPECIFICATION

## 1. Input

Unchanged from the base spec. A single **semicolon-delimited (`;`) CSV** with a
header row (a "SICPADetect spreadsheet export"). Trim whitespace from every header;
skip empty lines.

- **Required columns** (validation fails if any is missing): `Domain`, `URL`,
  `Status`, `Source`, `Rank`, `Updated at`, `Confidence`, `LLM Reasoning`,
  `Case Management Status`. If any are missing, **stop and report exactly which**.
- **Optional columns** (used only if present, never inferred): legal entity — first
  non-empty of `Legal entity`, `Legal Entity`, `Legal entity name`, `Entity`,
  `Operator`, `Operator name`; legal-entity country — first non-empty of
  `Legal entity country`, `Legal Entity Country`, `Entity country`,
  `Operator country`, `Jurisdiction`.
- **Recognized `Status` values:** `Licensed gambling`, `Illegal gambling`,
  `Not gambling`, `Unreachable`, `Review needed`. Any other value → `Unknown`.

Each surviving row is assigned a **category** per Part II before metrics are computed.

## 2. Build the working set ("standard")

Unchanged from the base spec:

1. Drop every row whose `Status` is **`Review needed`**.
2. **De-duplicate by `URL`**, keeping the first occurrence (rows with no URL are
   kept and keyed by their whole content).
3. The result is the **standard set**; `total = number of rows in it`. Every metric
   is computed over the standard set unless stated otherwise.

Helper definitions (from the base spec, retained):
`label(row)` = `Domain` if non-empty else `URL`;
`suffix(domain)` = last dot-segment (`casino.bet` → `.bet`; `(unknown)` if no dot);
`Source category` by prefix (`Manual` / `Google Search` / `Variant` / `Redirect` /
`Other`); `seed(Source)` = text inside first parentheses of `Source`;
`brand(row)` = `seed` for Variant/Redirect rows, else `label(row)`.

## 3. Metrics to compute

### 3.1 Counts  *(CHANGED)*
- `total` — size of the standard set.
- `illegal`, `esbkLicensed`, `gespaSupervised`, `notGambling`, `unreachable` —
  counts of each **category** in the standard set.
- `licensed` (= `esbkLicensed + gespaSupervised`) is retained only as an internal
  subtotal for denominators; it is **not** shown as a card (see §4 Section A).

### 3.2 Evaluation period & volume over time  *(unchanged)*
- Parse `Updated at` as a date; ignore unparseable values.
- `earliest` / `latest` = min / max parseable date (`YYYY-MM-DD`).
- `days` = inclusive span = `round((latest − earliest)/1 day) + 1`, else `0`.
- **URLs analyzed per day**: per date, count **distinct URLs**; output an
  ascending-by-date series `{ date, count }`.

### 3.3 Category distribution  *(CHANGED — replaces "Status distribution")*
Count each of the four reported categories — `ILLEGAL_GAMBLING`, `NON_GAMBLING`,
`ESBK_LICENSED`, `GESPA_SUPERVISED` — plus `UNREACHABLE`/`UNKNOWN` where present.
For each: `{ code, label, description, count, pct = count/total*100 }`, sorted by
count desc. Descriptions are the Part II "Meaning" text. Fixed colors:

| Category | Color |
|----------|-------|
| `ILLEGAL_GAMBLING` | `#c0392b` |
| `ESBK_LICENSED` | `#27ae60` |
| `GESPA_SUPERVISED` | `#1F3F63` |
| `NON_GAMBLING` | `#9aa7b4` |
| `UNREACHABLE` | `#7d3c98` |

### 3.4 Top 10 URL suffixes  *(unchanged)*
Group the standard set by `suffix(Domain)`. Per suffix:
`{ total, pct = total/all*100, illegal = count of ILLEGAL_GAMBLING,
pctIllegal = illegal/total*100 }`. Keep the **top 10 by total**.

### 3.5 Brands & variants (illegal only)  *(unchanged)*
Illegal rows whose Source category is `Variant`, grouped by `seed`; count distinct
URLs per seed → `brands = { seed, count }` desc. `distinctBrands` = number of seeds.
`topBrand` = seed with most variants; `topBrandVariants` = up to 40 `label`s.

### 3.6 Redirects (illegal only)  *(unchanged)*
Illegal rows whose Source category is `Redirect`, grouped by `seed`; distinct URLs
per seed; keep top 10. `topRedirect` = busiest seed; `topRedirectTargets` = up to 40
destination `label`s.

### 3.7 Naming-convention insights  *(unchanged)*
For variants and, separately, redirects, up to three bullets:
1. **Recurring keywords** — top 3 (with counts) among `mobile, m., account, login,
   secure, verify, support, app, bet, casino, win, play`; phrase as a *templated
   naming scheme*.
2. **TLD switching** — if names span >1 suffix, list top 4 suffixes (with counts).
3. **Distinct count** — "`N` distinct <variant|redirect> domains identified in
   total." No evidence → single bullet "No evidence found."

### 3.8 Comparison (illegal only)  *(unchanged)*
Split illegal rows into `variants` (Variant), `redirects` (Redirect), and `direct`
(remainder), each as a percentage of their sum.

### 3.9 Source analysis  *(CHANGED)*
For each category in fixed order `Manual, Google Search, Variant, Redirect, Other`:
`{ total, illegal, esbkLicensed, gespaSupervised,
pctIllegal, pctEsbk, pctGespa }` where percentages use
`illegal + esbkLicensed + gespaSupervised` as the denominator.

### 3.10 Regulatory-blocking evidence  *(unchanged)*
Scan `LLM Reasoning` (case-insensitive). A row is **evidence** if the reasoning
contains any of: `access to this site has been blocked`, `court order`,
`regulatory authority`, `illegal content`, `not permitted in your country`,
`blocked by`, `has been blocked` — **except** skip illegal rows whose reasoning also
contains `gambling site`. Capture `{ url, phrase, excerpt }` (~160 chars around the
phrase).

### 3.11 Rankings  *(CHANGED — see §4 Section C)*
Parse `Rank` numerically.
- **Top Ranked Gambling Sites** = all rows where `isGambling` **and** rank is
  numeric, ascending, top 15 → `{ rank, domain=label, category, categoryLabel,
  source }`.
- Retain a separate **ESBK ranking** and **GESPA ranking** feed for the added
  sections in §4 (Part IV): each is its category's ranked rows ascending. If a
  licensed category has no ranked rows, output a sample of up to 10 of its rows with
  rank shown as `—`.

### 3.12 Blocklist feed (illegal URLs)  *(unchanged)*
For every `ILLEGAL_GAMBLING` row emit `{ url, domain, brand, source,
rank (or null), date (YYYY-MM-DD from "Updated at", else raw),
status: "illegal_gambling", legalEntity, legalEntityCountry }`. Legal-entity fields
come only from the optional columns in §1 — blank if absent.

### 3.13 Licensed sites & ranks (ESBK and GESPA)  *(NEW — feeds Part IV)*
For each licensed category (`ESBK_LICENSED`, `GESPA_SUPERVISED`) independently, using
rows **found in the standard set**:
- **Sites**: distinct rows of that category → `{ label, registrableDomain, rank
  (or null), source }`, one entry per registrable domain.
- **Ranks**: the sites ordered by ascending numeric rank (`—` last).
- Empty when none found (explicit empty state, never fabricated).

> ⚠️ **CRITICAL — this table is data-driven and MAY BE EMPTY.** A SICPADetect export
> is typically a *blocklist-style* sample: it can contain **zero** licensed rows and
> **none** of the genuine ESBK/GESPA `.ch` domains. That is normal and correct — it
> does **not** switch off the variation report in §3.14. §3.14 is driven by the
> **Part I reference whitelist**, not by this table. Do not gate §3.14 on §3.13.

### 3.14 Brand-proximity variations (per licensed BRAND from Part I)  *(NEW — feeds Part IV)*
Detects **look-alike / impersonation** URLs that ride on a licensed brand, by
**string-matching the licensed brand tokens against the `Domain` and `URL` fields**
of every row.

> 🚫 **CRITICAL — match on `Domain`/`URL`, NEVER on the `Source` seed.** This is the
> single most common implementation error and the reason a run comes back empty. Do
> **not** reuse the base spec's illegal-variant machinery (§3.5/§3.6), which groups
> `Variant (seed)` / `Redirect (seed)` rows by their **Source seed**. In a blocklist
> export the seeds are *illegal* brands (e.g. `Variant (7reels-casino.com)`); a
> licensed brand **almost never appears as a seed**. Evidence from `data_ch.csv`:
> licensed brand tokens appear **0×** in the Source-seed column but **54×** in the
> `Domain`/`URL` columns. Variation detection therefore reads **only** `Domain` and
> `URL` (via `host(row)`); the `Source` column is carried into the output for context
> but is **never** the matching key. A variation may have any Source category.

> ⚠️ **CRITICAL — iterate over the WHITELIST, not over licensed rows in the data.**
> The detection loop's outer iterator is the **fixed list of 15 Part I brands**
> (13 ESBK + 2 GESPA), *whether or not* those brands appear anywhere in the standard
> set. For each reference brand, scan the **entire standard set** for look-alikes.
> A genuine licensed site does **not** need to be present in the sample for its
> variations to be found. (Earlier drafts that keyed this loop off §3.13 produced
> **zero** variations on blocklist exports — that is the bug this note fixes.)

**Reference brands & tokens (from Part I — the outer loop):**

| Ref registrable | Brand token(s) incl. aliases | Category | Rule |
|-----------------|------------------------------|----------|------|
| swisslos.ch | `swisslos`, `sporttip` | GESPA_SUPERVISED | token + typosquat |
| loro.ch | `loro`, `jouezsport`, `loterieromande` | GESPA_SUPERVISED | token + typosquat (`loro` short → boundary) |
| jackpots.ch | `jackpots` | ESBK_LICENSED | token + typosquat |
| mycasino.ch | `mycasino` | ESBK_LICENSED | token + typosquat |
| casino777.ch | `casino777` | ESBK_LICENSED | token + typosquat |
| starvegas.ch | `starvegas` | ESBK_LICENSED | token + typosquat |
| 7melons.ch | `7melons` | ESBK_LICENSED | token + typosquat |
| swiss4win.ch | `swiss4win` | ESBK_LICENSED | token + typosquat |
| pasino.ch | `pasino` | ESBK_LICENSED | **token only** (stem ≈ generic "casino") |
| swisscasinos.ch | `swisscasinos` | ESBK_LICENSED | token + typosquat |
| admiral.ch | `admiral` | ESBK_LICENSED | token + typosquat |
| hurrahcasino.ch | `hurrahcasino` | ESBK_LICENSED | token + typosquat |
| goldengrand.ch | `goldengrand` | ESBK_LICENSED | token + typosquat |
| gamrfirst.ch | `gamrfirst` | ESBK_LICENSED | token + typosquat |
| casineo.ch | `casineo` | ESBK_LICENSED | **token only** (stem ≈ generic "casino") |

Definitions:
```
host(row)        = host of URL (else Domain), lower-cased, leading "www." stripped
                   e.g. "https://www.swiss4-win.ch/x" -> "swiss4-win.ch"
registrable(x)   = last two dot-labels of x, lower-cased  (the eTLD+1)
                   e.g. "play-7melons.com" -> "play-7melons.com" (already 2 labels);
                        "secure.7melonsaffiliates.ch" -> "7melonsaffiliates.ch"
stem(reg)        = registrable minus its final TLD label  (jackpots.ch -> "jackpots")
alnum(s)         = s with every non-[a-z0-9] char removed (folds hyphens/dots)

GENERIC = { casino, casinos, bet, bets, betting, slot, slots, poker, vegas, win, wins,
            play, bingo, lotto, loto, spin, spins, roulette, gambling, gamble, game,
            games, sport, sports }        # never a typosquat on their own

For each Part I reference brand R (outer loop), scan EVERY row in the standard set:
  skip if registrable(row) == R.registrable         # the genuine site itself
  TOKEN MATCH  (always allowed):
     for each token t of R:
        if len(alnum(t)) <= 5:   # short tokens (e.g. "loro") must be delimited
            hit if regex (?<![a-z0-9]) t (?![a-z0-9]) matches host(row)
        else:
            hit if alnum(t) is a substring of alnum(host(row))
  TYPOSQUAT MATCH  (only if R.rule != "token only"
                    AND stem(registrable(row)) NOT in GENERIC):
     hit if SequenceMatcher ratio(stem(row), R.stem)   >= 0.86
         or SequenceMatcher ratio(registrable(row), R.registrable) >= 0.86

A row is a VARIATION CANDIDATE for R if TOKEN MATCH or TYPOSQUAT MATCH.
match_type = "token" if token matched else "typosquat".
```

Each candidate captures "brand name + other characters or a different suffix" — the
token wrapped in extra characters (`myswisslos`, `swiss4win-casino`, `jackpotslayer`)
and/or a swapped TLD (`pasino.com`, `casineo.gg`, `star-vegas.org`) — or a close
misspelling with no exact token (`jackpoty.com`, `harrahscasino.com`, `casino770.com`).

**Assign each candidate to a single best brand** (a row can token-match several
brands): choose the brand with (token over typosquat), then highest similarity. This
prevents double-counting one URL under multiple brands.

Scoring & ordering (per reference brand):
```
similarity(cand, R) = max stem/registrable SequenceMatcher ratio in [0,1]
rankKey(cand)       = numeric Rank if present, else +infinity (unranked sort last)

Order candidates by (match_type: token first, similarity DESC, rankKey ASC, host ASC).
Keep the TOP 20 per brand.   # "highest in rank and closest to the licensed domain"
```
*(If the export populates `Rank`, order by `rankKey ASC` first, then similarity — the
client asked for "highest in rank and closest". In blocklist exports `Rank` is often
empty, so similarity is the effective sort; state which applied in the run log.)*

Outputs:
- `variationsPerBrand` = for each Part I brand with ≥1 candidate:
  `{ licensedDomain, category, brandToken,
     variations: [ { url, domain, rank (or —), similarity, match_type, status, source } ] (≤20) }`.
- `variationCounts` = for each Part I brand: `{ licensedDomain, category, count }`
  (count = **all** matched candidates, not just the displayed top 20). Feeds the
  §4 "variations per licensed URL" bar charts. Brands with 0 may be omitted from the
  chart or shown at zero.
- If **no** brand has any candidate, show one explicit empty state for the whole
  report. Otherwise render only the brands that have candidates.

> **Reference implementation note.** This is exactly the matcher SICPA ran against
> `data_ch.csv`: iterating the 15 Part I brands over all 4,201 rows (all `Illegal`/
> `Not gambling`; **0 licensed**) yielded **49** look-alikes across 13 brands
> (swiss4win ×13, starvegas ×7, jackpots ×5, 7melons ×5, hurrahcasino ×4, pasino ×4,
> gamrfirst ×3, swisscasinos ×3, casino777/admiral/casineo/mycasino ×1, swisslos ×1).
> Keying the loop off licensed rows in the sample, or off the Source seed, yields
> **0** — the failure this section corrects.

**Canonical reference code (stdlib only — implement exactly this).** The matching
core below is authoritative; where prose and code differ, the code wins. The full
runnable version ships as `variation_matcher.py`; run `python3 variation_matcher.py
<export.csv>`.

```python
import csv, re
from difflib import SequenceMatcher

REFS = [  # (registrable, tokens[incl aliases], official_url, category, token_only)
    ("swisslos.ch",     ["swisslos","sporttip"],                 "https://www.swisslos.ch",        "GESPA_SUPERVISED", False),
    ("loro.ch",         ["loro","jouezsport","loterieromande"],  "https://www.loro.ch",            "GESPA_SUPERVISED", False),
    ("jackpots.ch",     ["jackpots"],     "https://www.jackpots.ch",        "ESBK_LICENSED", False),
    ("mycasino.ch",     ["mycasino"],     "https://www.mycasino.ch",        "ESBK_LICENSED", False),
    ("casino777.ch",    ["casino777"],    "https://www.casino777.ch",       "ESBK_LICENSED", False),
    ("starvegas.ch",    ["starvegas"],    "https://www.starvegas.ch",       "ESBK_LICENSED", False),
    ("7melons.ch",      ["7melons"],      "https://www.7melons.ch",         "ESBK_LICENSED", False),
    ("swiss4win.ch",    ["swiss4win"],    "https://www.swiss4win.ch",       "ESBK_LICENSED", False),
    ("pasino.ch",       ["pasino"],       "https://www.pasino.ch",          "ESBK_LICENSED", True),   # ≈"casino"
    ("swisscasinos.ch", ["swisscasinos"], "https://online.swisscasinos.ch", "ESBK_LICENSED", False),
    ("admiral.ch",      ["admiral"],      "https://www.admiral.ch",         "ESBK_LICENSED", False),
    ("hurrahcasino.ch", ["hurrahcasino"], "https://www.hurrahcasino.ch",    "ESBK_LICENSED", False),
    ("goldengrand.ch",  ["goldengrand"],  "https://www.goldengrand.ch",     "ESBK_LICENSED", False),
    ("gamrfirst.ch",    ["gamrfirst"],    "https://www.gamrfirst.ch",       "ESBK_LICENSED", False),
    ("casineo.ch",      ["casineo"],      "https://www.casineo.ch",         "ESBK_LICENSED", True),   # ≈"casino"
]
GENERIC = {"casino","casinos","bet","bets","betting","slot","slots","poker","vegas",
           "win","wins","play","bingo","lotto","loto","spin","spins","roulette",
           "gambling","gamble","game","games","sport","sports"}

def stem(reg): return reg.rsplit(".",1)[0]
def alnum(s):  return re.sub(r"[^a-z0-9]","",s.lower())
def registrable(host):
    labels = host.split(".")
    return ".".join(labels[-2:]) if len(labels) >= 2 else host
def host_of(domain, url):
    h = (domain or "").strip().lower()
    if not h:
        m = re.match(r"https?://([^/]+)", (url or "").lower()); h = m.group(1) if m else ""
    return h[4:] if h.startswith("www.") else h

def match_row(domain, url):
    host = host_of(domain, url)
    if not host: return None
    reg, ha, rstem = registrable(host), alnum(host), stem(registrable(host))
    best = None
    for ref_reg, tokens, ref_url, cat, token_only in REFS:
        if reg == ref_reg: continue                       # genuine site itself
        rstem_ref = stem(ref_reg); hit = None
        for t in tokens:                                   # TOKEN on Domain/URL only
            ta = alnum(t)
            if len(ta) <= 5:
                if re.search(r"(?<![a-z0-9])"+re.escape(ta)+r"(?![a-z0-9])", host): hit=t; break
            elif ta in ha: hit=t; break
        ss = SequenceMatcher(None, rstem, rstem_ref).ratio()
        sr = SequenceMatcher(None, reg,  ref_reg ).ratio()
        if hit:                       mtype = "token"
        elif (not token_only and rstem not in GENERIC and (ss>=0.86 or sr>=0.86)): mtype="typosquat"
        else: continue
        score = (1 if mtype=="token" else 0, round(max(ss,sr),4))
        cand = dict(url=url or host, domain=host, similar_url=ref_url, category=cat,
                    match_type=mtype, similarity=round(ss,2))
        if best is None or score > best[0]: best = (score, cand)
    return best[1] if best else None
```
> Notes: the matcher reads `Domain`/`URL` via `host_of` (never `Source`); short tokens
> use a boundary regex; `token_only`/`GENERIC` suppress the `casineo↔casino`,
> `pasino↔casino` false positives; each row is assigned to its single best brand.

## 4. Report structure (render in this order)

### Section A — "The numbers"  *(CHANGED)*
- **Metric cards:** Total URLs analyzed · Illegal gambling (count) · **Licensed by
  ESBK (count)** · **Supervised by GESPA (count)** · Evaluation period (`days`,
  with `earliest → latest`).
  *(The single "Licensed gambling" card from the base spec is removed and replaced
  by the two category cards above; the evaluation period and total-URL cards are
  retained.)*
- **Chart — "URLs analyzed per day":** line chart of the §3.2 series.
- **Chart — "Category distribution":** pie chart + table of
  `label / description / count / pct` for `ILLEGAL_GAMBLING`, `NON_GAMBLING`,
  `ESBK_LICENSED`, `GESPA_SUPERVISED` (plus `UNREACHABLE` if present), using the
  §3.3 colors, **plus a bar graph of their totals**.
- **Chart — "Top 10 URL suffixes":** bar chart + table of
  `suffix / total / % of all / illegal / % illegal`.

### Section B — "The insights"  *(unchanged from base spec)*
- **"Brands and variants (`distinctBrands` distinct brands)":** bar chart of top
  brands by variant count (empty state when none).
- **"Variant naming convention insights":** the §3.7 variant bullets.
- **"Variant proliferation — `topBrand.seed`"** (only if a top brand exists): node
  diagram, seed at center, variant URLs around it; interpretation:
  "`seed` is the most-cloned brand with `N` variant URLs."
- **"Redirects from — top 10":** bar chart (empty state otherwise).
- **"Redirect propagation — `topRedirect.url`"** (only if one exists): node diagram
  source → destinations; interpretation: "`url` redirects to `N` destinations."
- **"Comparison — URLs → redirects → variants":** metric cards for the §3.8 split.

### Section C — "Ranking"  *(CHANGED)*
- **"Top Ranked Gambling Sites"** — table of the §3.11 top-15 across **all** gambling
  categories, columns `rank / domain / category (Illegal · Licensed by ESBK ·
  Supervised by GESPA) / source`. The category column makes clear, for each ranked
  site, whether it is `ESBK_LICENSED`, `GESPA_SUPERVISED`, or `ILLEGAL_GAMBLING`.
  *(This replaces the base spec's separate "Illegal ranking" and "Licensed ranking"
  tables.)*

### Section D — "Key insights"
The five narrative cards in §5.

## 5. The five Key Insights (narrative)

Compute first: `illegalShare = illegal/total*100`;
`illegalOfGambling = illegal/(illegal+esbkLicensed+gespaSupervised)*100`;
`licensedOfGambling = (esbkLicensed+gespaSupervised)/(illegal+esbkLicensed+gespaSupervised)*100`;
`enforcement = evidence count`.

1. **Scale of the analysis** — total distinct URLs over the evaluation period
   (`days`, plus `earliest → latest` if known), of which N illegal, N licensed by
   ESBK and N supervised by GESPA.
   *Take:* the sample is large enough to reason about patterns, not isolated cases.
2. **Status mix (three-way)** *(CHANGED)* — illegal is `illegalShare`% of all URLs
   and `illegalOfGambling`% of gambling sites; the authorised remainder splits into
   **`esbkLicensed` ESBK-licensed casinos** and **`gespaSupervised` GESPA-supervised
   lottery/betting operators** (`licensedOfGambling`% of gambling sites combined).
   Note unreachable and not-gambling counts.
   *Take:* illegal operators are "the majority" if `illegalOfGambling ≥ 50%`, else
   "a substantial minority"; the licensed environment is anchored by the closed
   ESBK/GESPA regime.
3. **Variants and brand abuse** — `distinctBrands` brands cloned via variant
   domains; the most-abused brand `topBrand.seed` spawned `topBrand.count` variants.
   Where variations target an **ESBK** or **GESPA** brand from Part I (see §3.14),
   call that out explicitly (impersonation of an authorised operator) and name the
   licensed brands with the most look-alikes. If no variants: state that variant
   proliferation is not a factor.
   *Take:* a handful of brands drive most proliferation; prioritize enforcement,
   especially clones of authorised (ESBK/GESPA) brands.
4. **Redirects and traffic shaping** — `illegalRedirects` illegal URLs use redirect
   chains; the busiest source `topRedirect.url` points to `topRedirect.count`
   destinations. If none: direct access dominates.
   *Take:* redirects keep a stable entry point while rotating sites behind it.
5. **Enforcement and regulatory relevance** — `enforcement` pages already show
   regulatory-blocking indicators (court orders, regulator notices, block pages).
   If zero: the set appears pre-enforcement and is a candidate for a first pass.
   *Take:* a measurable share is already under enforcement (or: candidate for a
   first enforcement pass).

---

# PART IV — ADDED CLIENT REPORTS

Rendered after Section C, before Section D.

> **Dependency rule.** The **Sites tables** below come from §3.13 and are data-driven
> (they may be empty). The **variations tables and charts** come from §3.14 and are
> **whitelist-driven** — they render whenever look-alikes exist in the sample, *even
> when the Sites table above them is empty*. Never suppress the variations output
> because no licensed rows were found; the two are independent.

### Section C-bis — "GESPA-supervised — sites, variations & ranks"
Iterate over the **2 GESPA brands from Part I** (Swisslos, Loterie Romande):
- **Sites table** (§3.13, data-driven, may be empty): `domain / brand (Part I) /
  rank (or —) / source`, ordered by ascending rank. Empty state:
  "No GESPA-supervised sites appeared in this sample (expected for a blocklist
  export)."
- **Top-20 brand-proximity variations, per brand** (§3.14, whitelist-driven): for
  each GESPA brand with candidates, a table of its **top 20** variations —
  `url / domain / rank (or —) / similarity / match_type / status / source` — ordered
  highest in rank and closest to the licensed domain. Look-alikes of Swisslos /
  Loterie Romande brands (e.g. `swisslos`, `sporttip`, `loro`, `jouezsport`).
- **Chart — "Variations per GESPA-supervised brand"** (§3.14 `variationCounts`): bar
  chart, one bar per GESPA brand, height = total matched variations (full count, not
  just the displayed 20).
- **Empty state (variations):** "No look-alikes of GESPA-supervised brands were
  detected in this sample."

### Section C-ter — "ESBK-licensed — sites, variations & ranks"
Iterate over the **13 ESBK brands from Part I**:
- **Sites table** (§3.13, data-driven, may be empty): `domain / land-based operator
  (Part I, where known) / rank (or —) / source`, ordered by ascending rank. Empty
  state: "No ESBK-licensed sites appeared in this sample (expected for a blocklist
  export)."
- **Top-20 brand-proximity variations, per brand** (§3.14, whitelist-driven): for
  each ESBK brand with candidates, a table of its **top 20** variations —
  `url / domain / rank (or —) / similarity / match_type / status / source` — ordered
  highest in rank and closest to the licensed domain. Look-alikes of licensed casino
  brands (e.g. `swiss4win`, `starvegas`, `jackpots`, `7melons`).
- **Chart — "Variations per ESBK-licensed brand"** (§3.14 `variationCounts`): bar
  chart, one bar per ESBK brand, height = total matched variations.
- **Empty state (variations):** "No look-alikes of ESBK-licensed brands were detected
  in this sample."

> **Combined overview (optional):** a single grouped bar chart may additionally plot
> variation counts across **all** licensed URLs (GESPA + ESBK together), coloured by
> category (`#1F3F63` GESPA, `#27ae60` ESBK), to surface which authorised brands
> attract the most impersonation at a glance.

---

# PART V — OUTPUT & PRESENTATION NOTES

- Percentages are shown to **one decimal place**; similarity scores to **two**.
- **Empty states are explicit** (e.g. "No variant-based brand abuse was detected in
  this sample."), never fabricated data.
- Category **codes** (`ILLEGAL_GAMBLING`, `ESBK_LICENSED`, `GESPA_SUPERVISED`,
  `NON_GAMBLING`) are used for data categorisation; **display labels**
  ("Illegal Gambling Site", "Licensed by ESBK", "Supervised by GESPA",
  "Not Gambling") are used on every rendered surface.
- "Variations" (§3.14, brand-proximity look-alikes) and "variants" (base-spec
  Source-category `Variant`) are **distinct concepts**; keep the terminology
  separate on rendered surfaces to avoid confusion.
- Colors are brand-fixed and must stay readable in light and dark themes; the
  categorical palette is `#1F3F63, #c0392b, #27ae60, #7d3c98, #9aa7b4, #2f5c8f,
  #e67e22`.
- The Part I whitelist must be reconciled against the live ESBK/Gespa pages before
  each run; any `LICENSED_UNMATCHED` flags from Part II §2.1 are listed in the run
  log for manual review.
- The report is self-contained per configuration; the blocklist feed (§3.12)
  remains the one output consumed by the downstream Blocklist screen, where an
  operator can promote an illegal site to `blacklisted`.

---

*Prepared by SICPA SA for Loterie Romande — "Evaluation of CH Online Gambling
Environment". Emission date 7 August 2026. Regulatory rosters in Part I change over
time; confirm against official ESBK and Gespa sources before relying on this
specification.*
