---
name: Obsidian Reserve
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#45474c'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#111516'
  on-tertiary: '#ffffff'
  tertiary-container: '#26292b'
  on-tertiary-container: '#8d9092'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  max-width: 1280px
---

## Brand & Style

The design system is built on a foundation of **European Minimalism**, emphasizing functional clarity and architectural precision. The brand personality is sophisticated, calm, and inherently trustworthy, moving away from high-energy digital accents toward a palette that feels permanent and deliberate. It targets a discerning audience that values silence over noise and quality over quantity.

The visual style utilizes **Tonal Minimalism**—a focus on material layering and subtle shifts in luminosity rather than decorative elements. It draws inspiration from modern industrial design, where the tactile quality of a surface is defined by its finish and structural integrity. The emotional response is one of focus and quiet confidence.

## Colors

The color strategy replaces vibrant accents with a high-end, monochromatic-adjacent blue-grey scale. 

- **Primary (#1E293B):** A deep charcoal-navy reserved for primary interactive states, providing high contrast and authoritative grounding.
- **Secondary (#64748B):** A muted grey-blue for secondary information and iconography, maintaining readability without competing for attention.
- **Tertiary (#F8FAFC):** An off-white, cool-toned neutral used for container backgrounds and section fills to prevent the clinical feel of pure white.
- **Neutral (#0F172A):** Used primarily for typography and borders to ensure the sharpest possible definition.

In dark mode scenarios, the palette should invert with the deep navy becoming the surface color and lighter grey-blues serving as the strokes and text.

## Typography

This design system uses a triple-font approach to balance character with utility. 

- **Manrope** is used for headlines to provide a modern, balanced, and premium feel. 
- **Inter** is the workhorse for body text, ensuring maximum legibility across all viewport sizes due to its neutral and systematic nature.
- **JetBrains Mono** is introduced for small labels, data points, and metadata to reinforce the technical precision and European aesthetic.

All headlines should favor tighter letter spacing to maintain a "locked-in" architectural appearance. Body copy should remain at a comfortable 150% line-height to ensure a calm reading experience.

## Layout & Spacing

The layout is governed by a **fixed-grid system** on desktop and a **fluid-grid system** on mobile. The grid uses a 12-column structure with generous 24px gutters to allow the UI to "breathe."

- **Desktop:** Centralized 1280px container with 64px outer margins.
- **Mobile:** 4-column layout with 16px margins. 
- **Rhythm:** All spacing (padding, margins) must be increments of 4px. Use larger spacing values (48px, 64px, 80px) between distinct sections to create a sense of premium "whitespace luxury."

## Elevation & Depth

This design system avoids traditional heavy shadows. Instead, it utilizes **Low-Contrast Outlines** and **Tonal Layers**.

Depth is communicated by placing surfaces on top of each other using subtle background color shifts (e.g., a `#F8FAFC` card on a `#FFFFFF` background). When an elevation shadow is strictly necessary for a floating element (like a dropdown), use an ultra-diffused, low-opacity navy tint (`rgba(15, 23, 42, 0.08)`) with a large blur radius to keep the effect soft and integrated rather than detached.

## Shapes

The shape language is disciplined and geometric. A "Soft" roundedness is applied to UI elements to prevent the interface from feeling aggressive or overly industrial.

- **Standard Buttons/Inputs:** 0.25rem (4px) corner radius.
- **Cards/Containers:** 0.5rem (8px) corner radius.
- **Full-bleed elements:** 0px radius.

The goal is to maintain a crisp, sharp appearance that feels aligned with architectural blueprints.

## Components

### Navigation & Logo
Prioritize the **horizontal mark without text** for all top-level navigation. The logo should be treated as a pure geometric symbol, rendered in the primary charcoal color or knocked out to white on dark backgrounds. This reinforces the minimalist, sophisticated brand identity.

### Buttons
- **Primary:** Solid `#1E293B` with white text. No gradient. No shadow.
- **Secondary:** Transparent background with a 1px border of `#CBD5E1`.
- **States:** Hover states should involve a subtle shift in luminosity (10% lighter/darker) rather than a color change.

### Input Fields
Inputs use a minimal bottom-border only or a very light 1px surrounding border. Focus states are indicated by a 1px solid Primary color border. Use JetBrains Mono for placeholder text to signify the "input" nature of the field.

### Cards & Lists
Cards should not have borders if they sit on a tertiary background; instead, use a white fill to define the area. List items should be separated by thin, low-contrast 1px lines (`#E2E8F0`).

### Chips
Use subtle grey-blue fills (`#EDF2F7`) with the label-sm typography style. Chips should be rectangular with the standard 4px radius, avoiding the pill shape to maintain the architectural theme.