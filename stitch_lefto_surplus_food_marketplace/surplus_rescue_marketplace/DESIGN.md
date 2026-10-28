---
name: Surplus Rescue Marketplace
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#3f493f'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#6f7a6e'
  outline-variant: '#becabc'
  surface-tint: '#006d30'
  primary: '#00652c'
  on-primary: '#ffffff'
  primary-container: '#15803d'
  on-primary-container: '#d3ffd5'
  inverse-primary: '#79db8d'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#00625b'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b7c74'
  on-tertiary-container: '#c5fff7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#95f8a7'
  primary-fixed-dim: '#79db8d'
  on-primary-fixed: '#00210a'
  on-primary-fixed-variant: '#005323'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#9cf2e8'
  tertiary-fixed-dim: '#80d5cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#00504a'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  price-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '800'
    lineHeight: 26px
    letterSpacing: -0.02em
  price-strikethrough:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0em
  label-badge:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-button:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
  layout-margin-mobile: 1rem
  layout-margin-tablet: 1.5rem
  layout-margin-desktop: 2.5rem
  gutter-mobile: 0.75rem
  gutter-desktop: 1.5rem
---

## Brand & Style

The brand addresses India's urban surplus food ecosystem with urgency, culinary delight, and uncompromising trust. The design merges the operational clarity and rapid scanability of leading food delivery platforms with an ethical, climate-conscious mission. 

The aesthetic avoids the austere, clinical feel of standard sustainability platforms. Instead, it balances fresh appetite appeal with environmental impact. Visuals evoke the warmth of fresh bakery batches, rich cloud-kitchen curries, and crisp produce. 

The overarching visual style combines Modern Consumer-Tech with Warm Tactile Accents:
- High contrast, pristine typographic hierarchy calibrated for fast street-level scanning.
- Crisp boundary definitions paired with micro-diffused, ambient drop shadows.
- Distinct value signalling: discount callouts, environmental savings counters, and pickup countdown timers.
- Playful yet structured micro-interactions that celebrate rescued meals without gamifying hunger or guilt-tripping the consumer.

## Colors

The color system is optimized for high-conversion e-commerce clarity, outdoor legibility under bright sunlight, and appetizing contrast:

- **Primary Green (`#15803D`)**: The anchor of sustainability and freshness. Used for main action flows, primary buttons, confirmed pickup statuses, and carbon-offset metrics.
- **Secondary Orange (`#F97316`)**: The culinary trigger. Reserved for critical promotional badges, discount percentages, time-sensitive "Rescue Bags" alerts, and urgency highlights (e.g., "Only 2 left").
- **Tertiary Deep Teal (`#0F766E`)**: Used sparingly for certified partner verifications, category chips, and corporate ESG impact modules.
- **Neutral Surface & Text (`#111827`, `#6B7280`, `#E5E7EB`, `#F9FAFB`, `#FFFFFF`)**:
  - `#111827` ensures high-contrast readability across headlines and rupee values.
  - `#6B7280` handles secondary descriptions, pickup slot windows, and distance markers.
  - `#E5E7EB` delivers crisp hairline borders to prevent visual bleed on low-end displays.
  - `#F9FAFB` provides a calm backdrop that makes white card modules float effortlessly.

## Typography

Typography relies entirely on **Plus Jakarta Sans**, chosen for its geometric foundation, open counters, and contemporary humanist warmth.

- **Numerals and Currency Representation**: Indian Rupee (`₹`) symbols must be explicitly rendered at matching line-heights without clipping. The glyphs use tabular figures for real-time counters and strikethrough original retail prices.
- **Micro-Copy Scannability**: Discount badges use uppercase styling with slight letter-spacing (`0.04em`) to establish visual punch at small sizes.
- **Hierarchy Rules**: Store names receive `headline-sm` or `headline-md`, item titles use `body-md` (semi-bolded), and meta tags (e.g., pickup hours, walking distance) stay strictly on `body-sm` in neutral gray.

## Layout & Spacing

The layout employs a responsive fluid-grid structure adhering to an 8px base rhythm (with 4px micro-steps for icons, badges, and tag padding):

- **Mobile (< 640px)**: 4-column layout with 16px page margins and 12px gutters. Feed items display as single stacked hero cards or edge-to-edge horizontal carousels with 16px snap padding.
- **Tablet (640px – 1024px)**: 8-column layout with 24px margins. Category listings reflow into a balanced 2-column grid.
- **Desktop (> 1024px)**: 12-column layout centered with a maximum content container width of 1240px, 40px margins, and 24px gutters. Reflows listings into 3- or 4-column item grids with persistent sticky discovery/filter panels.

Interactive targets strictly observe a minimum physical hit area of 44×44px on mobile viewports.

## Elevation & Depth

Visual hierarchy uses clean atmospheric layering rather than muddy, dark shadows. India’s bright ambient usage requires crisp, recognizable boundaries:

- **Level 0 (Base Canvas)**: Neutral surface `#F9FAFB`.
- **Level 1 (Store / Food Item Card)**: `#FFFFFF` background with a crisp border (`1px solid #E5E7EB`) and an ambient tinted shadow: `0px 2px 8px -1px rgba(17, 24, 39, 0.05)`.
- **Level 2 (Hover / Active Listing)**: Slightly elevated on interaction: `0px 8px 20px -3px rgba(17, 24, 39, 0.08)`, border changes to `rgba(21, 128, 61, 0.2)`.
- **Level 3 (Floating Search Bar & Bottom Navigation Bar)**: Floating surfaces carry a subtle ambient dispersion: `0px 10px 30px -4px rgba(17, 24, 39, 0.10)`, with background blur `backdrop-filter: blur(12px)` and 95% opacity white fill.
- **Level 4 (Modals & Pickup Action Sheets)**: `0px 20px 40px -8px rgba(17, 24, 39, 0.16)` overlaying an ultra-subtle backdrop scrim of `rgba(17, 24, 39, 0.45)`.

## Shapes

The design system embraces a welcoming `Rounded` profile:

- **Card Shells**: `16px` (`rounded-xl` or `1rem`) corner radius creates a modern food-app container feel without appearing childlike.
- **Buttons & Search Bars**: `12px` to `16px` for structured actions; persistent floating sticky buttons use full-pill styling (`9999px`).
- **Badges & Tags**: Fully rounded pill shapes (`9999px`) for discount callouts ("60% OFF"), vegetarian/non-veg dietary markers, and pickup time indicators.
- **Media Containers**: Food photography headers within cards maintain matched inner radiuses: top corners rounded at `15px`, bottom at `0px` when flush with content.

## Components

### 1. Primary & Secondary Buttons
- **Primary CTA ("Reserve Bag")**: Background `#15803D`, label in `#FFFFFF` (`label-button`), height 48px, radius 12px or pill. Subtle hover transition to `#166534`.
- **Urgent Rescue Action**: Background `#F97316`, white text, used for time-sensitive flash rescues.
- **Secondary / Ghost Button**: `#FFFFFF` background, 1px border `#E5E7EB`, text `#111827`. Hover shifts border to `#15803D`.

### 2. Surplus Mystery & Item Rescue Cards
- White surface, 16px radius, hairline border `#E5E7EB`.
- Top image container (16:9 ratio) with relative overlays:
  - Top-left: Discount tag (pill, background `#F97316`, text `#FFFFFF`, bold `11px`).
  - Top-right: Remaining stock badge ("3 left", translucent white with blur, text `#111827`).
- Card Body: 
  - Store name with verified green checkmark.
  - Bag title (e.g., "Assorted Viennoiserie & Breads").
  - Pickup window: Pill badge with clock icon (`#F3F4F6`, text `#374151`).
  - Price cluster: Current rescue price in bold `#111827` (e.g., `₹149`), original price strikethrough in `#9CA3AF` (e.g., `₹450`).

### 3. Food Category & Filter Chips
- Horizontal scrolling track. 
- Height 36px, fully pill-shaped.
- Inactive: Background `#FFFFFF`, border `1px solid #E5E7EB`, text `#4B5563`.
- Active: Background `#15803D`, border `1px solid #15803D`, text `#FFFFFF`, subtle scale micro-spring.

### 4. Interactive Search Bar
- Floating container, 52px height, 16px radius, background `#FFFFFF`, shadow Level 3.
- Left: Search icon in `#15803D`.
- Center: Placeholder "Search bakeries, curries, sweet shops near you..." in `#9CA3AF`.
- Right: Quick-filter trigger with geographic distance selector (e.g., "< 3 km").

### 5. Selection Controls (Veg / Non-Veg / Diet Checkboxes & Toggles)
- Standardized Indian dietary markers: Green square border with filled circle for 100% Vegetarian; brown square border with filled triangle for Non-Vegetarian.
- Radio buttons: 20px circular controls with `#15803D` inner disc when selected.

### 6. Impact Metric Modules
- Compact summary cards tracking consumer savings: "₹1,240 saved" and "4.2 kg CO₂e prevented".
- Soft green background `#F0FDF4` with dark emerald `#166534` numerical display.