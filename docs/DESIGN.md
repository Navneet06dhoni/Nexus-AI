# ANTIGRAVITY DESIGN SYSTEM
### Reference: CyberLife / Detroit: Become Human diegetic UI

A flat, technical, "blueprint-on-vellum" interface style. No glassmorphism, no gradients, no glow, no drop shadows. Precision over decoration.

---

## 1. Locked Design Tokens (Official Style Guide Reference)

```css
:root {
  /* Status/diode colors — these are functional, not decorative: */
  --status-blue:   #00D1FF;  /* WRK — normal functioning / connected / online */
  --status-yellow: #FFF500;  /* LDNG — loading, menu opening, interactive activation */
  --status-red:    #FF0000;  /* ERR — network error, connection lost */

  /* Typography */
  --font-display: 'Gotham Ultra', 'Gotham Pro Bold', 'Montserrat', sans-serif;   /* ONLY for the word "DETROIT" */
  --font-subtitle: 'Gotham Rounded Light', 'Gotham Pro Light', 'Montserrat', sans-serif; /* ONLY for "BECOME HUMAN" subtitle */
  --font-body: 'Gotham Pro', 'Montserrat', sans-serif; /* everything else — Bold/Medium/Regular/Light */
  --font-mono: 'IBM Plex Mono', 'Roboto Mono', monospace;

  /* Type scale (from spec sheet) */
  --size-display: 60px;   /* hero H1 */
  --size-h2: 22px;
  --size-h3: 17px;
  --size-body-lg: 15px;
  --size-body: 13px;
  --size-label: 10px;
  --size-micro: 8px;

  /* Grid */
  --grid-columns: 12;
  --grid-width: 1240px;
  --grid-gutter: 20px;

  /* Base Canvas & Panels */
  --bg-canvas: #F2F2F0;       /* main background, warm off-white, paper/blueprint feel */
  --bg-panel: #F7F7F5;        /* content panel background, slightly lighter than canvas */
  --bg-panel-alt: #FFFFFF;    /* card/tile background inside panels */

  /* Text */
  --text-primary: #1A1A1A;    /* headlines, high-emphasis text */
  --text-secondary: #8A8A8A;  /* labels, nav, body copy — used ~80% of the time */
  --text-tertiary: #B8B8B6;   /* disabled / watermark text */

  /* Accent */
  --accent-cyan: #1BA8D1;     /* active states, selected tabs, node highlights, status icon */
  --accent-cyan-fill: #00C2E0;/* solid fill variant for filled nodes/buttons */
  --accent-navy: #1E3A5F;     /* photo/thumbnail overlays, diagram tile backgrounds */
  --accent-alert: #D6483C;    /* lock icons, warnings only */

  /* Structure */
  --line-hairline: #DADAD8;   /* 1px panel borders, dividers */
  --line-diagram: #C7CDD2;    /* connector lines in flowcharts */
  --watermark-shape: #E7E7E5; /* faint diamond/rhombus background motif */
}
```

**Critical Brand Rule:** "DETROIT" is always set in Gotham Ultra/Bold (heavy weight), and "BECOME HUMAN" directly beneath it is always Gotham Rounded Light, small, letter-spaced, grey — this two-weight logo lockup must be reused identically in every nav bar across the whole site, never simplified to one weight.

**Status Icon Behavior:** The circular ring icon (top-right of nav) is a functional status indicator (android temple diode). It must visually change per state: solid `--status-blue` ring = online/normal, `--status-yellow` pulse = loading/menu opening, `--status-red` ring = error state.

---

## 2. Typography


```css
--font-display: 'Eurostile', 'Neue Haas Grotesk', 'Roboto Condensed', sans-serif;
--font-mono: 'Roboto Mono', 'IBM Plex Mono', monospace; /* codes, timestamps, counters */

--tracking-label: 0.12em;   /* all-caps nav/labels */
--tracking-headline: 0.01em;
--tracking-mono: 0.05em;
```

| Role | Size | Weight | Case | Tracking | Color |
|---|---|---|---|---|---|
| Hero headline | 40–56px | 300–400 (light/regular, never bold) | Mixed, brand word can be bold-weight | normal | `--text-primary` |
| Nav item | 12–13px | 400–500 | UPPERCASE | 0.12em | `--text-secondary`, `--text-primary` when active |
| Section label (eyebrow) | 11–12px | 500 | UPPERCASE | 0.12em | `--accent-cyan` or `--text-secondary` |
| Body copy | 13–14px | 400 | Sentence case | normal | `--text-secondary` |
| Diagram node text | 10–11px | 500 | UPPERCASE | 0.06em | white (on filled) / `--text-secondary` (on outline) |
| Mono/data readout | 11–12px | 400 | as-is | 0.05em | `--text-secondary` |

**Rule:** Hierarchy is built with SIZE and COLOR, not boldness. Bold weight is reserved for a single active/selected element.

---

## 3. Spacing & Grid

```css
--space-unit: 4px;
--space-xs: 8px;
--space-sm: 16px;
--space-md: 24px;
--space-lg: 40px;
--space-xl: 64px;
--space-xxl: 96px;

--panel-padding: 40px;      /* outer panel breathing room */
--panel-margin: 24px;       /* panel floats inside viewport, never full-bleed */
--nav-gap: 40px;            /* generous gap BETWEEN nav items, not tight grouping */
```

**Rules:**
- Panels never touch the viewport edge — always a visible `--panel-margin` of canvas around them.
- Nav items are spaced apart, not clustered; only the active item gets a background pill.
- Content sits inside one large bordered panel (1px `--line-hairline`) with generous internal padding — the panel reads as a physical sheet/workbench object.

---

## 4. Shape Language

```css
--radius-none: 0px;         /* default for almost everything */
--radius-hairline: 1px;     /* borders */
--radius-pill: 999px;       /* ONLY for the active-tab background pill and status dot */
--radius-tile: 2px;         /* diagram nodes, small tiles — barely-there rounding */

--border-width: 1px;        /* the only stroke weight used, everywhere */
```

**Rules:**
- Sharp corners by default. Radius is reserved for: (1) the active nav pill, (2) the circular status/AI icon, (3) a 1–2px softening on diagram node tiles.
- No shadows. Depth is created by layering flat panels and faint watermark shapes, never by elevation/blur.
- No gradients anywhere — all fills are flat, single-color.

---

## 5. Core Components

### 5.1 Top Nav Bar
- Thin horizontal strip, height ~64px, bottom border `1px solid var(--line-hairline)`.
- Logo/wordmark left-aligned, uppercase, tight two-line lockup (name + tagline in mono/small caps below).
- Nav links centered or left-of-center, uppercase, `--nav-gap` apart.
- Active nav item: light grey/white pill background (`--radius-pill`), text color `--text-primary`.
- Right side: search icon, profile icon, and a small circular status indicator — a ring with a solid `--accent-cyan` fill, no label needed.

### 5.2 Content Panel
- Large container, 1px hairline border, `--bg-panel` fill, `--panel-padding` inner spacing.
- Optional faint diagonal diamond/rhombus watermark (`--watermark-shape`) behind hero imagery — large, centered-right, bleeding off-canvas.

### 5.3 Hero Headline Block
- Eyebrow label above (uppercase, small, `--text-secondary` or `--accent-cyan`).
- Headline: large + light weight, one key word can shift to bold/heavier weight for emphasis (never full-bold sentence).
- Supporting paragraph directly below: small, `--text-secondary`, max-width ~420px, tight leading.
- Two flat tab/toggle buttons below copy (e.g. "SPECIFICATIONS" / "INFORMATION"): rectangular, `--radius-tile`, active = filled `--accent-cyan-fill` bg + white text; inactive = outline only.

### 5.4 Data Callout Box
- Small inset box, `--accent-navy` background or duotone photo treatment.
- Contains: mono label (e.g. "THIRIUM 310"), uppercase sub-label, short description line, optional schematic/molecular graphic rendered in cyan linework.
- Positioned as an overlay/anchor near the subject image, connected visually by proximity not by line.

### 5.5 Video/Media Thumbnail Tile
- Small rectangular tile, duotone navy-blue treated photo.
- Centered play-button (simple triangle in circle outline, cyan or white).
- Caption below in mono: "watch video / 00:27" style, `--text-secondary`, tiny size.

### 5.6 Flowchart / Node Diagram
- Canvas background: `--bg-canvas`, large faint diamond watermark behind.
- **Nodes**: flat rectangles, `--radius-tile`, ~2px border.
  - Active/important node: filled `--accent-cyan-fill`, white uppercase mono-ish text.
  - Inactive node: white/outline fill, `--border-width` grey border, `--text-secondary` uppercase text.
  - Node padding: tight, ~8px vertical / 12px horizontal.
- **Connectors**: `--line-diagram`, 1px, strictly orthogonal/right-angle routing (Manhattan style) — never curved or diagonal.
- **Junction dots**: small filled circles (cyan or grey) at branch points along connectors.
- **Lock badge**: small square tag, `--accent-alert` fill, white padlock glyph, attached to top-left corner of a gated node.
- **Warning badge**: small triangle icon, grey or alert color, attached similarly for "not required" or caution states.
- **Embedded thumbnail node**: a node can contain a small photo crop instead of text — same rectangle treatment, image fills the tile.
- **Utility bar** (bottom): row of icon+label pairs (e.g. "WORLD'S STATS", "SHOW LEGEND", "ZOOM", "SCROLL", "CONTINUE") — grey icon, uppercase grey mono label, evenly spaced, no button chrome until hover.

### 5.7 Footer Strip
- Bottom bar, hairline top border.
- Left: brand wordmark, small/uppercase.
- Center: literal barcode graphic + small numeric code beneath (mono, tiny, grey) — purely decorative "product/inventory" signal.
- Right: pagination as plain text fraction ("1/5") + language toggle ("RU / EN") as plain uppercase text links, no button styling.

---

## 6. Signature Decorative Details ("HUD" layer)

Apply sparingly — 2–3 per screen max, not on every element:

- **Corner brackets**: thin L-shaped marks (viewfinder-style) at panel corners or around a focal subject.
- **Crosshair/reticle marks**: small `+` glyphs floating near focal points of hero imagery, cyan or grey, 1px stroke.
- **Ghost/echo image**: a large, semi-transparent (8–12% opacity) duplicate of the hero subject behind the main image, same hue as `--text-tertiary`.
- **Diamond/rhombus watermark**: oversized geometric shape faintly visible behind content, signature repeated motif across screens.
- **Status ring icon**: small circle, thin outline + solid cyan fill segment, used as a persistent "AI active" indicator, top-right of nav.

---

## 7. Motion (implied, for interactive builds)

- No easing bounce/spring — linear or ease-out only, fast (120–180ms).
- Hover states: swap outline→filled on tab/nodes, no scale transforms, no shadow pop.
- Connector lines can "draw on" (stroke-dashoffset animation) when a diagram loads.

---

## 8. Anti-Patterns (what makes this look like AI slop instead)

Avoid all of the following — they are the default output of most AI UI generators and are the opposite of this style:

- ❌ Rounded corners > 4px on cards/buttons
- ❌ Drop shadows / elevation / glassmorphism blur
- ❌ Gradients of any kind (backgrounds, buttons, text)
- ❌ Multiple accent colors competing for attention
- ❌ Bold weight on body text or paragraphs
- ❌ Curved/diagonal connector lines in diagrams
- ❌ Full-bleed content with no panel margin
- ❌ Tight, cramped nav spacing
- ❌ Icon-only buttons with filled colored backgrounds (keep them outline/ghost until hover)

---

## 9. Quick-Reference Cheat Sheet

```
Background:     #F2F2F0 (warm off-white, never pure white)
Panel border:   1px solid #DADAD8
Text:           #1A1A1A primary / #8A8A8A secondary (secondary dominates)
Accent:         #1BA8D1 cyan — ONE color, used sparingly
Alert:          #D6483C — spot use only (locks/warnings)
Type:           Condensed grotesk, light-to-regular weight, UPPERCASE + wide tracking for labels
Corners:        0px default, 999px only for active-pill/status dot
Shadows:        none, ever
Diagram lines:  1px, right-angle only, grey-blue
Decoration:     corner brackets, barcode strip, crosshair marks, faint diamond watermark, ghost image echo
```
