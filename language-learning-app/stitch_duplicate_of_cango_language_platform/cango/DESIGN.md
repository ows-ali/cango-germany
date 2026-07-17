---
name: CanGo
colors:
  surface: '#f6fafd'
  surface-dim: '#d6dbdd'
  surface-bright: '#f6fafd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4f7'
  surface-container: '#eaeef1'
  surface-container-high: '#e5e9eb'
  surface-container-highest: '#dfe3e6'
  on-surface: '#171c1e'
  on-surface-variant: '#3e484d'
  inverse-surface: '#2c3133'
  inverse-on-surface: '#edf1f4'
  outline: '#6e797e'
  outline-variant: '#bdc8ce'
  surface-tint: '#006780'
  primary: '#00647c'
  on-primary: '#ffffff'
  primary-container: '#007f9d'
  on-primary-container: '#fafdff'
  inverse-primary: '#6cd3f7'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#4d5d73'
  on-tertiary: '#ffffff'
  tertiary-container: '#66768d'
  on-tertiary-container: '#fdfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b7eaff'
  primary-fixed-dim: '#6cd3f7'
  on-primary-fixed: '#001f28'
  on-primary-fixed-variant: '#004e61'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f6fafd'
  on-background: '#171c1e'
  surface-variant: '#dfe3e6'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  unit-xs: 4px
  unit-sm: 8px
  unit-md: 16px
  unit-lg: 24px
  unit-xl: 48px
---

## Brand & Style
The design system is rooted in a refined European startup aesthetic, prioritizing clarity, intentionality, and a "quiet premium" feel. It is designed for adult learners who value efficiency and professional growth over gamification. 

The style is **Minimalist-Modern**, drawing influence from high-utility tools like Linear and Revolut. It utilizes a disciplined hierarchy where whitespace is treated as a functional element to reduce cognitive load. Visual interest is generated through precise typography, subtle depth, and a sophisticated color application rather than decorative elements. The emotional response is one of calm focus, competence, and reliability.

## Colors
The palette is professional and restrained. The primary accent is a modern **Teal (Cyan 600)**, used sparingly for calls-to-action and progress indicators to maintain its impact. 

- **Primary:** Used for focus states, primary buttons, and active learning paths.
- **Secondary (Charcoal):** Used for primary headings and high-contrast UI elements to provide a grounded, authoritative feel.
- **Neutral (Stone/Slate):** A range of soft grays used for backgrounds (`#F8FAFC`), borders (`#E2E8F0`), and secondary text (`#64748B`).
- **Functional:** Success, Warning, and Error states should use desaturated versions of green, amber, and red to remain cohesive with the professional tone.

## Typography
The design system exclusively uses **Inter** to achieve a systematic, utilitarian, and clean look. 

- **Headlines:** Use a tighter letter-spacing (`-0.02em`) for a more "designed" and editorial feel.
- **Body Text:** Optimized for long-form reading with a generous line height (1.5–1.6) to ensure clarity during language exercises.
- **Micro-copy:** Labels and captions use a slightly heavier weight (Medium/SemiBold) to maintain legibility at smaller scales.
- **Language Content:** Foreign language strings should always be rendered in the Primary color or a distinct weight to differentiate them from the UI instructions.

## Layout & Spacing
The layout follows a **Fluid Grid** model with strict adherence to an 8px spatial rhythm. 

- **Desktop:** A 12-column grid with a max-width of 1200px. Content is centered with generous 40px side margins to create a focused "reading lane."
- **Mobile (PWA):** A 4-column grid with 16px margins. Bottom-sheet patterns are preferred for mobile inputs to maintain ergonomics.
- **Spacing Philosophy:** Use `unit-xl` (48px) to separate major sections and `unit-md` (16px) for internal card padding. This high-contrast spacing (tight vs. loose) creates a clear visual hierarchy.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** and **Ambient Shadows**. This design system avoids heavy drop shadows in favor of a layered "stack" approach.

- **Level 0 (Background):** Solid `#F8FAFC`.
- **Level 1 (Cards/Surface):** Pure White (`#FFFFFF`) with a very soft, diffused shadow: `0 4px 12px rgba(15, 23, 42, 0.03)`.
- **Level 2 (Modals/Overlays):** Elevated White surface with a more defined shadow: `0 12px 32px rgba(15, 23, 42, 0.08)`.
- **Interactive Elements:** Buttons utilize a subtle 1px inner border (top-lit) to provide a tactile, premium feel without looking skeuomorphic.

## Shapes
The shape language is sophisticated and consistent. 

- **Cards & Containers:** Use `rounded-lg` (16px) or `rounded-xl` (24px) for major dashboard components and lesson containers.
- **Buttons & Inputs:** Use `rounded-md` (8px) for a more professional, structured appearance than full circles.
- **Progress Bars:** Use fully rounded (pill-shaped) ends to signify fluid movement and completion.

## Components
- **Buttons:** Primary buttons use a solid Teal background with white text. Secondary buttons use a transparent background with a subtle slate border. Focus states use a 2px outer ring in Teal.
- **Cards:** White surfaces with 16px-24px rounded corners and an extremely thin 1px border (`#E2E8F0`). Padding should be a minimum of 24px for desktop.
- **Progress Indicators:** Sleek, thin bars (4px-6px height). Use the Primary Teal for the fill and a desaturated version for the track. Transitions must be smooth (300ms ease-out).
- **Inputs:** Clean fields with labels in `label-md` (Charcoal). The active state is indicated by a Primary Teal border; error states use a soft Red border with text below.
- **Chips/Badges:** Used for difficulty levels (e.g., A1, B2). These should have low-contrast backgrounds (e.g., light gray) with charcoal text to avoid cluttering the UI.
- **Icons:** Use linear, consistent weight icons (24px). Avoid multi-color icons; stick to the Neutral or Primary palette.