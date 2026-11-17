# strawhat dashboard design spec

A pixel-level reconstruction of the two reference screens Avi supplied (Machines and Subscriptions, and Context). Skills UI is specified only so it can be left out. All measurements are in source pixels of the PNGs. Colours were sampled with Python and Pillow from those files.

## Sources

| Screen | File | Pixel size |
|---|---|---|
| Machines and Subscriptions | `ref/01-machines-subscriptions-full.png` | 2965 × 2960 |
| Context | `ref/02-context-full.png` | 2879 × 4096 |

Originals live under `/home/box/agent-data/agents/a0ed28cf-5754-479f-aa89-6e3b7a0192ce/attachments/`. Crops used while writing this spec are in `/workspace/dashboard/ref/`.

These are dark-theme product shots of a floating app shell on a purple stage. There is no light-theme reference. Treat the PNGs as the ground truth. A 2× interpretation is tempting (hairlines are 2 px, the sidebar is 512 px) but the Machines card width is 2661 px (odd), so do not blindly divide by two. Implement against the source pixel grid, then scale the whole shell if you need it to sit in a smaller viewport.

## Stage and shell

The product is not a full-bleed website. It is a single rounded rectangle, centred on a vertical purple gradient.

### Backdrop gradient

A soft vignette, brighter and more violet at the top centre, darker toward the bottom right. Sampled values:

| Location | Hex |
|---|---|
| Top left | `#393477` |
| Top centre | `#4A4096` |
| Top right | `#27214D` |
| Left middle | `#292655` |
| Bottom left | `#211D40` |
| Bottom centre | `#17152B` |
| Bottom right | `#0C0C16` |

Use a CSS radial or stacked linear gradient that hits those stops, not a flat fill. There is no hard stage border. A faint darker bloom sits just outside the shell, especially along the lower right.

### Shell frames

Machines and Subscriptions:

- Stage padding is 152 px on every side.
- Shell box is `(152, 152) → (2812, 2807)`, size **2661 × 2656**.
- 152 + 2661 + 152 = 2965, and 152 + 2656 + 152 = 2960.

Context:

- Stage padding is 148 px on every side.
- Shell box is `(148, 148) → (2730, 3947)`, size **2583 × 3800**.
- 148 + 2583 + 148 = 2879, and 148 + 3800 + 148 = 4096.

The two shots are slightly different canvases (Avi resized or scrolled between them). The shell itself is the same design: same corner, same fill, same sidebar width. Rebuild to the Machines frame when you need a canonical size, and let the shell grow vertically with content, keeping 152 px stage padding (or a close 148 to 152 px) around it.

### Corner radius and rim

Border radius is **24 px**, measured from the top-left corner of the Machines shell (first interior fill appears 24 px inset on the top row, and the left edge becomes vertical 24 px later). See `ref/05-corner-tl-machines.png` through `08-corner-br-machines.png`.

A 1 to 2 px rim sits on the rounded edge, slightly lighter than the fill, about `#1B1B23` to `#202126` against the purple outside. It reads as a hairline border, not a drop shadow. Inside, the fill is flat.

### Shell fill

| Token | Hex | Where |
|---|---|---|
| Shell fill | `#0E0E10` | Sidebar and main pane. They are the same colour, not two greys. |
| Hairline, dividers, card strokes | `#28282A` | Also `#272729` in antialiased stretches. Use `#28282A`. |
| Hairline muted / inset | `#1B1B1D` | Recessed panels, asleep cards. |
| Raised fill | `#151517` | Hover or selected rows, icon wells. |
| In-use row fill | `#171E3A` | The highlighted subscription row. |

## Layout grid

```
+--------------------------------------------------------------+
| 152 px purple stage                                          |
|   +----------+---------------------------------------------+ |
|   | SIDEBAR  | MAIN                                        | |
|   | 512 px   | 2 px rule at x=664, then content            | |
|   |          |                                             | |
|   | brand    | page title (serif)                          | |
|   | nav      | section (Machines / topology)               | |
|   | servers  | section (Subscriptions / etc.)              | |
|   | sandboxes|                                             | |
|   | footer   |                                             | |
|   | theme    |                                             | |
|   +----------+---------------------------------------------+ |
| 152 px purple stage                                          |
+--------------------------------------------------------------+
```

### Sidebar

- Width **512 px** from the shell's left edge to the divider (source x = 152 to 664).
- Divider is a **2 px** vertical rule at x = 664 and 665, colour `#28282A`.
- No sidebar background tint. The rule is the only separation.
- Inner padding is about 44 to 48 px from the shell's left rounded edge to the nav icons. Keep icons, labels and trailing counts on one baseline.
- Top: circular brand mark (the pale "ghost" face in `ref/29-logo-strawhat.png`) plus the lowercase wordmark, then a small panel-collapse icon on the right of that row.
- Primary nav, from the top, each row ~44 to 48 px tall, 16 to 18 px gap between groups:
  1. All machines, with a trailing fraction such as `8/12`
  2. Previews
  3. Proxy
  4. Context, with a trailing count or "1 changed"
  5. Secrets
- The active item (All machines on the first screen, Context on the second) is a slightly lighter row, near `#151517`, with the label at primary text colour. Inactive labels are muted.
- Section label `SERVERS`, then a tree of providers and machines. Group rows show a status fraction (`2/2`) and a disclosure chevron. Child rows show a live CPU percent on the right, or `asleep`.
- Section label `SANDBOXES`, trailing count and a small `+` affordance, then the same tree pattern.
- Footer, pinned to the bottom of the sidebar (`ref/11-sidebar-footer-toggle.png`):
  - Mint status dot + `8 online · 4 asleep` (use a mid-dot `·`, not a hyphen).
  - `Hub {name}` in muted text.
  - `{n} cores · up {duration}` in muted text.
  - Theme switch: three adjoining 1 px-stroke square buttons, about 36 × 36 px each, forming one segmented control. Icons are sun, crescent moon, and a desktop display (system). In the reference the display icon is the brightest, so system-follows-OS is the selected state, and the OS theme is dark.

### Main pane

- Starts immediately after the 2 px sidebar rule.
- Page title sits near the top, left-aligned with the first content column. Title content boxes, measured tightly around the glyphs:

  | Title | Box (source) | Size |
  |---|---|---|
  | Machines | (666, 253) → (905, 296) | 240 × 44 |
  | Subscriptions | (666, 1370) → (938, 1416) | 273 × 47 |
  | Context | (666, 247) → (843, 289) | 178 × 43 |

  Cap height is 43 to 47 px. There are no descenders in these words. A serif at roughly 56 to 60 px / regular is the right starting point. Colour is `#F4F4F6` (also `#F5F5F7`, antialiased).
- Horizontal padding from the sidebar rule to the title and card column is about 44 to 48 px (title left edge is 666, rule ends at 666).
- Sections stack vertically with a generous gap (about 80 to 100 px from the bottom of the topology card to the Subscriptions title).
- The first screen is a single scrolling column: Machines (topology) then Subscriptions. The second screen is Context only.

## Typography

Three voices, and no more.

### 1. Display serif (page titles, and the "strawhat" wordmark)

Contemporary old-style serif, modest contrast, slightly soft terminals, double-storey "a", nearly horizontal bar on "e", round dot on "i". Not Playfair, not a high-contrast didone, and not a slab.

Closest free starting points: **Instrument Serif**, then **Newsreader**. Lock the face only after overlaying it on `ref/12-heading-machines.png` and `ref/13-heading-subscriptions.png` at the measured cap height. The wordmark appears to use the same face in lowercase, next to the circular mark.

### 2. UI sans (navigation, machine names, labels, body)

A neo-grotesque at regular and medium. Inter, Geist or SF Pro are close enough to start. Machine names are 13 to 14 px equivalent at this source size? They read larger because the canvas is huge: treat names as about 18 to 20 px, section labels (`TAILNET`, `SERVERS`, `SANDBOXES`, `CPU`, `MEM`) as 11 to 12 px uppercase with a little letter-spacing, colour `#646368`.

Primary text on dark: `#F4F4F6`. Secondary text: about `#646368` to `#8A8A8E`. The "asleep" state is the secondary colour, not struck through.

### 3. Data face (percentages, latencies, money, core counts)

Tabular figures, monospaced or a sans with `font-variant-numeric: tabular-nums`. Geist Mono, IBM Plex Mono or ui-monospace are the right family. Used for `14%`, `63 ms`, `$1542.27`, `16 cores · 15 GB`, and the big total `$1675.87`. Money uses a `$` prefix, no space, two decimal places, and a thousands separator. Latency is an integer and `ms`.

Do not put body copy in the mono face, and do not put numbers in the serif.

## Colour tokens (sampled)

| Token | Hex | Use |
|---|---|---|
| `stage.topCentre` | `#4A4096` | Backdrop |
| `stage.topLeft` | `#393477` | Backdrop |
| `stage.bottomRight` | `#0C0C16` | Backdrop |
| `shell.fill` | `#0E0E10` | App background |
| `shell.rim` | `#202126` | 1 px rounded stroke |
| `line` | `#28282A` | Dividers, card borders, topology wires, meter tracks |
| `line.subtle` | `#1B1B1D` | Dashed asleep-card borders |
| `text.primary` | `#F4F4F6` | Titles, names, money |
| `text.secondary` | `#646368` | Labels, timestamps, "standby", "asleep" |
| `meter.blue` | `#3C5194` | CPU and MEM bars, hub sparkline, Surplus-style credit bar |
| `meter.blueBright` | `#6B8CFF` | Token-usage fill on Context |
| `meter.gold` | `#F5B93F` | DeepSeek-style credit bar |
| `meter.danger` | `#F45170` | Over-limit or 93 to 100% week bars |
| `status.online` | `#32C591` | Online dots |
| `badge.teamFill` | `#205342` | "Team Premium" badge background |
| `badge.teamText` | `#51B291` | "Team Premium" badge text |
| `badge.max` | `#D47555` | "Max 20x" terracotta |
| `row.inUse` | `#171E3A` | Highlighted account row |
| `toggle.icon` | `#F4F4F6` | Selected theme icon |
| `toggle.iconMuted` | `#646368` | Unselected theme icons |

Hover and selected nav can use `#151517`. Do not introduce a second accent blue. The steel `#3C5194` is the working accent; `#6B8CFF` is only for the token chart fill; gold and raspberry are reserved for credits and over-limit.

## Component: topology (Machines)

See `ref/15-topology-machines.png`, `ref/16-hub-card.png`, `ref/17-machine-card-tailnet.png`, `ref/18-sandboxes.png`.

A large 1 px `#28282A` rounded rectangle wraps the whole diagram. Inside, three columns on the top row and a sandboxes band underneath, joined by orthogonal wires.

### Provider groups (left and right)

Each group is a stacked pair (or more) of machine cards under a header:

- Left: a small 2 × 2-dot "tailnet" glyph, uppercase `TAILNET`, and `2 of 2 up` on the right.
- Right: a provider mark, uppercase `OVHCLOUD · SINGAPORE`, and `2 of 2 up`.

Each machine card:

- Left: a 28 to 32 px rounded machine icon (laptop, phone, vendor mark).
- Name in primary sans, bold/medium.
- Under the name: a small glyph + location or network (`Tailnet`, `Singapore`) in secondary text, then `16 cores · 15 GB`.
- Right: `CPU` and `MEM` labels, each followed by a short horizontal meter (track `#28282A`, fill `#3C5194`) and a mono percent.
- Just outside the card, on the wire, a mono latency such as `63 ms`.

Wires are 2 px `#28282A`, with square junctions. Left group connects to the hub from mid-right; right group from mid-left. A vertical stem drops from the hub to the sandboxes band.

### Hub card (centre)

A wider, taller card than the machine tiles.

- Top left: hub icon (in the reference, a small appliance or "box" glyph).
- Name in sans, then a tiny `hub` badge (lowercase, rounded rectangle, 1 px stroke, tight padding).
- Under the name: provider and region, `Google Cloud · Taiwan`, with a small cloud glyph.
- A sparkline about 16 to 20 px tall, full width of the card's inner area: line and area fill in `#3C5194`, over a faint hatched or ruled baseline.
- Caption under the chart, secondary + mono: `25% CPU · 2 cores · 1.5 GB of 7.7 GB`.

### Sandboxes band

A dashed 1 px `#28282A` rounded rectangle, labelled `SANDBOXES` at top left and `3 awake · 4 asleep` at top right.

Two provider rows (Modal, Instabox), each with a vendor icon, name, and an awake/total fraction (`2/2`, `1/5`). Cards in the row:

- Awake cards use a solid 1 px `#28282A` stroke and the same CPU/MEM meters as machine cards.
- Asleep cards use a dashed stroke, secondary text, the word `asleep` in place of the core/RAM line, and empty meters shown as a small hatched or slashed stub with `-` for the percent.

Cards wrap onto a second row when there are more than three or four in the group. Empty trailing space stays empty; do not stretch the last card.

## Component: subscriptions

See `ref/19-subscriptions.png`, `ref/20-subscriptions-claude.png`, `ref/21-subscriptions-google.png`, `ref/22-credits-bars.png`.

Header row, on the same baseline as the "Subscriptions" serif title, aligned to the right:

- A pill toggle labelled `Fable limit`, switch on the left of the label, 1 px `#28282A` stroke, fully rounded.
- A dropdown pill `Last 7 days`, same stroke, with a chevron.

Directly under the title, one summary line in mixed sans and mono:

`{money} over last 7 days · {n}k requests · {n}B tokens`

The money is the hero figure (about 28 to 32 px, still not the serif).

### Provider columns

A 1 px `#28282A` table, two equal columns, split by a vertical rule.

Column header:

- Provider mark (Claude starburst, Google four-point spark).
- Name, then a secondary status such as `7 of 7 ready` or `Antigravity · 5 logins`.
- Right-aligned mono total, with a small `list price` caption.

Each account row is about 56 to 64 px tall:

- A 6 px status dot (mint when ready).
- Account name.
- A plan badge immediately under the name (`Max 20x`, `Pro`, `Team Premium`, `Free`). Badge is a tight rounded rectangle, 11 to 12 px type. Team Premium uses `#205342` fill and `#51B291` text. Max 20x is terracotta `#D47555`. Pro is a mid blue in the same family as `#3C5194`.
- A secondary line such as `standby` or `in use`. The in-use row gets the `#171E3A` fill and a brighter name.
- Two thin usage meters labelled `5h` and `week`, with mono percents. Tracks are `#28282A`. Fill is `#3C5194` until the value is high, then `#F45170`.
- A secondary countdown (`in 2h 26m`) under each meter, meaning time until the window resets.
- Right-aligned mono spend.

Google rows also show two tiny named bars (`Gemini`, `Claude`) and, for free or exhausted accounts, a secondary note such as `Gemini out · back in 3d 23h`.

### Credits band

A full-width footer inside the same table, labelled `Credits` with a secondary caption `pay as you go · 2 providers`, and a right-aligned `{money} left`.

Each provider is one row:

- Glyph + name.
- `used {money}` on the left of a long meter.
- Meter fill is `#F5B93F` for the first (DeepSeek in the reference) and `#3C5194` for the second.
- `{n}% left` and `{remaining} of {total}` in mono on the right.

A text link at the bottom right of the section: `Reorder or pause accounts →`, in the bright meter blue.

## Component: Context page (without skills)

See `ref/23-context-machine-sync.png`, `ref/24-context-token-chart.png`, `ref/25-context-instructions.png`.

The reference also has a Skills table and a "Not managed yet" importer (`ref/26-context-skills-OMIT.png`, `ref/27-context-not-managed-OMIT.png`). **Do not build those.** Avi asked to ignore skills. Keep the rest of the page.

### Top bar

Serif title `Context`. On the right, a `Sync now` button (ghost, 1 px stroke, refresh icon) and, in the reference, a bright `+ New skill` button. Drop the New skill button. Sync now can stay if we have anything to sync (machine context, instructions, T3 state). Otherwise omit both.

A subtitle `Showing skills on All machines` should be rewritten, for example `Showing context on All machines`, with a dropdown if we filter by machine.

### Machine sync topology

A compact version of the Machines topology: the same grouping (providers as rows, machines as small cells), but each cell is a short card with a sync state and a relative time (`synced 2m ago`, `asleep`, `sah: timed out after 30s`). A status strip at the top right of the block: coloured dots and counts such as `7 in sync · 3 asleep · 1 not reached`.

Use these state colours, from the Skills legend in the reference (keep the colours even though the table is omitted):

- In sync: mint `#32C591`
- Changed there: gold `#F5B93F`
- Updating: mid blue `#3C5194` or `#6B8CFF`
- Not there yet: muted grey
- Off / switched off: darker grey
- Not reached: a muted red, not as hot as `#F45170`

### Token preamble chart

A section label `EVERY SESSION STARTS WITH`, a large `~1.8k tokens` figure, and a right-aligned aside `READ ONLY WHEN A TASK NEEDS IT` with `+25k tokens across {n} units`.

A single horizontal stacked bar, about 16 to 20 px tall, on a `#28282A` track. The leading chunk is `#6B8CFF` (and `#3C5194` for subsequent chunks). Named segments sit under the bar (`effect-ts 4.2k`, `code-review`, …). A caption explains what is always included versus what is on demand.

For Avi's dashboard this should map to T3 or agent context usage, not skill packs. If we cannot get token counts yet, keep the layout and show a honest empty state rather than inventing numbers.

### Instructions

A section title `Instructions`, with a right-hand caption for the file source if we have one. Each row is a disclosure: a chevron, a name (`Default`, `Sandbox add-on`, `Machines`), a token estimate, and a short qualifier (`every machine starts with it`). We can point this at machine notes, dashboard runbooks, or T3 custom instructions. Do not build a skills editor here.

## Theme toggle

Three options in one segmented control, bottom left of the sidebar: light (sun), dark (moon), system (display). The reference is dark, with system selected. Until a light theme is designed from a real light screenshot, implementing light as a simple invert will look wrong. Ship dark + system (system follows OS, falling back to dark), and treat a true light theme as a later pass.

## Motion and density

The reference is tight and quiet. No large drop shadows, no glass blur inside the shell, no colourful backgrounds on cards. Meters are tiny. Type is small except for the serif titles and the subscription total. Keep animation to 100 to 200 ms fades and sparkline draws. Prefer hairlines over filled boxes.

## What not to copy

- The "strawhat" name and ghost mark are the reference product's brand, not ours. Use Avi's own wordmark, or a simple typographic name, in the same layout slot.
- Skills table, skill counts on the Context title, New skill, Import, and "Not managed yet".
- Any decorative screenshot crop, window chrome, or OS traffic lights. There are none in the reference; do not add them.
- A full-bleed typography or colour experiment. The purple stage plus `#0E0E10` shell is the look.

## Overlay checklist

Before calling a screen done, place the implementation over the matching PNG at 1:1 source pixels (or a documented integer scale) and check:

1. Stage padding and 24 px corner with the light rim.
2. Sidebar width 512 px and the 2 px `#28282A` rule.
3. Serif title cap height and `#F4F4F6` colour against `ref/12-heading-machines.png`.
4. Topology: hub in the centre, wires with latencies, sandboxes dashed band.
5. Meter colour `#3C5194`, danger `#F45170`, online `#32C591`.
6. Subscriptions two-column split, in-use navy row, credits gold/blue bars.
7. Context without any skills block, still showing sync topology, token chart and instructions.
8. Theme control, footer counts, mid-dot separators.

## Crop index

| File | What |
|---|---|
| `01-machines-subscriptions-full.png` | Full first screen |
| `02-context-full.png` | Full second screen |
| `03-machines-card.png` | Shell only, first screen |
| `04-context-card.png` | Shell only, Context |
| `05`–`08-corner-*-machines.png` | Four corners, 2× nearest-neighbour |
| `09-sidebar-machines.png` | Sidebar, first screen |
| `10-sidebar-context.png` | Sidebar, Context |
| `11-sidebar-footer-toggle.png` | Footer counts and theme switch |
| `12-heading-machines.png` | "Machines" glyphs, 3× |
| `13-heading-subscriptions.png` | "Subscriptions" glyphs, 3× |
| `14-heading-context.png` | "Context" glyphs, 3× |
| `15-topology-machines.png` | Whole topology |
| `16-hub-card.png` | Hub tile |
| `17-machine-card-tailnet.png` | A machine tile |
| `18-sandboxes.png` | Sandboxes band |
| `19`–`22` | Subscriptions and credits |
| `23`–`25` | Context sync, token chart, instructions |
| `26`, `27` | Skills regions, for omission only |
| `28-backdrop-gradient-left.png` | Left-margin gradient strip |
| `29-logo-strawhat.png` | Reference mark, do not ship as ours |
