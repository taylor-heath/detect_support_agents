# Report: Variant URL Map

## Purpose
Visualize illegal-gambling variant networks as interactive, clickable
hub-and-spoke maps. Each hub is a seed brand being impersonated; each spoke is a
distinct clone URL attributed to that brand. The reader can explore which
operators are spawning the most clones and click through to any variant URL.

## Source
Context = Data Set. Operate over the report's associated dataset. Each row has
at least: `Source`, `Status`, `Domain`, `URL`.

## Selecting variant rows
A row is a **variant** only when BOTH hold:
1. `Status == "Illegal gambling"` — variants are computed over illegal rows
   only.
2. The `Source` category is `Variant`.

Classify `Source` by its prefix (`normalizeSource`): `Manual`, `Google Search`,
`Variant`, `Redirect`, else `Other`. Only `Variant` rows are mapped here.
(`Redirect` rows follow the same seed rule and may be included as a secondary
node type if the instructions request it, but the default map is `Variant` rows
only.)

## Extracting the seed
For a variant row, the **seed** is the text inside the first parentheses of
`Source` (`seedFromSource`). Example:

    Source = "Variant (bet365.com)"  →  seed = "bet365.com"

The seed is the original brand/domain the variant is impersonating. All clones
roll up to their seed brand (`brandOf`), not to the clone's own domain — so a
network is one operator, not many.

## Forming the networks
Group variant rows by `seed`. Within each seed, group by **distinct `URL`**
(dedupe repeated URLs). This produces a hub-and-spoke structure per seed:

- **Hub (center node)** = the seed brand (e.g. `bet365.com`) — one operator.
- **Spoke nodes** = the distinct variant URLs attributed to that seed, each
  labelled by its `Domain` (fall back to the full `URL` if `Domain` is absent).

## Metrics to compute and display
- `brands` = `[{ seed, count }]` — every seed with its number of distinct
  variant URLs, sorted descending by count.
- `distinctBrands` = number of seeds (i.e. number of variant networks).
- `topBrand` = the seed with the most variants.
- `topBrandVariants` = up to 40 variant domain labels for `topBrand`.

## Visualization — REQUIRED
Render an **interactive, clickable hub-and-spoke graph** as the centerpiece of
the HTML report. This is a real rendered graph, not a description or static
image. Use D3.js or Cytoscape.js loaded via CDN so the HTML is self-contained
and opens standalone in a browser.

Requirements:
- Render each seed as a **central hub node** with its variant URLs radiating out
  as spokes (force-directed or radial layout). Multiple networks may be shown
  together (hubs unconnected to each other) or one network at a time — see
  "Scale" below.
- Hub node size encodes the seed's variant `count`; the largest hub is
  `topBrand`.
- **Each spoke node is clickable** and opens its variant `URL` in a new tab.
  Hub nodes are labelled by seed.
- Hovering any node shows a tooltip: for hubs, the seed and variant count; for
  spokes, the full URL and domain.
- The graph must be pan/zoom-enabled and legible as node count grows.

## Scale handling
Real datasets can contain many networks and very large ones. To keep the map
legible:
- Default view: show the top N networks by `count` (e.g. top 10 hubs), with a
  control to reveal the rest.
- For a single very large hub, cap rendered spokes (mirror the `topBrandVariants`
  limit of 40) and note "+X more" with access to the full list in the table
  below.

## Supporting content
Alongside the graph, include:
- A summary line: `distinctBrands` networks, total variant URLs, and `topBrand`
  with its count.
- A ranked bar chart of `brands` (seed vs. distinct-variant count), top 15–20.
- A collapsible table of all variants: seed, domain, clickable URL, status.

## Layout
1. Title
2. Summary (distinctBrands, totals, topBrand)
3. Interactive variant network map (primary visual)
4. Ranked brands bar chart
5. Full variant table