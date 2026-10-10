---
name: Pastel Link Hub
colors:
  surface: '#fef8f4'
  surface-dim: '#ded9d5'
  surface-bright: '#fef8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f2ef'
  surface-container: '#f3ede9'
  surface-container-high: '#ede7e3'
  surface-container-highest: '#e7e1de'
  on-surface: '#1d1b19'
  on-surface-variant: '#554245'
  inverse-surface: '#32302e'
  inverse-on-surface: '#f5f0ec'
  outline: '#887175'
  outline-variant: '#dbc0c4'
  surface-tint: '#a03b56'
  primary: '#a03b56'
  on-primary: '#ffffff'
  primary-container: '#ff85a1'
  on-primary-container: '#771b38'
  inverse-primary: '#ffb1c0'
  secondary: '#006a65'
  on-secondary: '#ffffff'
  secondary-container: '#79f3ea'
  on-secondary-container: '#006f69'
  tertiary: '#785a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cfa53f'
  on-tertiary-container: '#513c00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9df'
  primary-fixed-dim: '#ffb1c0'
  on-primary-fixed: '#3f0016'
  on-primary-fixed-variant: '#81233f'
  secondary-fixed: '#7cf6ec'
  secondary-fixed-dim: '#5dd9d0'
  on-secondary-fixed: '#00201e'
  on-secondary-fixed-variant: '#00504c'
  tertiary-fixed: '#ffdf9b'
  tertiary-fixed-dim: '#edc157'
  on-tertiary-fixed: '#251a00'
  on-tertiary-fixed-variant: '#5b4300'
  background: '#fef8f4'
  on-background: '#1d1b19'
  surface-variant: '#e7e1de'
typography:
  headline-xl:
    fontFamily: Comfortaa
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Comfortaa
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Comfortaa
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Comfortaa
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Comfortaa
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Quicksand
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  body-sm:
    fontFamily: Quicksand
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-lg:
    fontFamily: Quicksand
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Quicksand
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Quicksand
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.25rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.875rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style
This design system crafts an affectionate, approachable, and tactile mobile-first link hub and digital storefront profile. Designed for creators, boutique bakeries, artisan brands, and lifestyle entrepreneurs, the aesthetic blends playful neo-soft tactile elements with delicate pastel warmth. 

The visual personality feels generous, welcoming, and sweet without being juvenile. It evokes an instant sense of delight, safety, and care. Surface treatments favor floating marshmallow-soft containers, plump interactive tap-targets, and pillowy affordances that invite spontaneous engagement.

## Colors
The palette balances confectionary softness with crisp functional accessibility:
- **Primary (`#FF85A1`)**: Sweet rose pink, serving as the dominant focus color for key brand interactions, active states, and high-priority action cards.
- **Secondary (`#4ECDC4`)**: Fresh mint/turquoise, applied to fast communication conduits like WhatsApp connect buttons, active status indicators, and micro-badges.
- **Tertiary (`#FFD166`)**: Warm butter yellow, reserved for featured promotions, attention-grabbing highlights, operating hour banners, and ratings.
- **Neutral Background (`#FFF9F5`)**: Cream whip canvas, creating a warm, non-glare foundation that replaces sterile stark whites.
- **Supportive Accents**: Soft lavender (`#CDB4DB`) anchors secondary action groups, flipbook links, and decorative pill tag backgrounds. High-contrast typography sits on a velvety plum-charcoal (`#3D2E39`) to guarantee effortless readability over all pastel fills.

## Typography
Typography combines the geometric, circular terminals of **Comfortaa** for display titles and header landmarks with the highly legible, rounded humanist warmth of **Quicksand** for body text and interactive labels. 

Always preserve medium-to-bold weights (500–700) to maintain crisp legibility over pastel and tinted surfaces. Avoid ultra-thin cuts. All headline tokens feature generous leading to accommodate character ascenders and descenders with zero visual cramping.

## Layout & Spacing
The layout follows a centered single-column mobile-first flow constrained to a maximum width of `480px` on tablets and desktop browsers. 

Content cards and interactive link buttons stack vertically with rhythmic `space-md` (`0.875rem`) to `space-lg` (`1.25rem`) gaps, ensuring generous thumb hit targets of at least 52px height. On desktop screens, the canvas remains centered within an ambient pastel border frame to retain its compact, conversational mobile app nature.

## Elevation & Depth
Depth is realized through pastel-tinted ambient shadows and physical squash-and-stretch tactile cues, rather than stark grayscale drop shadows:
- **Surface Level (Base Canvas)**: Flat `#FFF9F5` warm cream.
- **Level 1 (Default Interactive Cards & Buttons)**: Solid white (`#FFFFFF`) or tinted pastel surfaces backed by a warm multi-stop shadow: `0 8px 24px -4px rgba(255, 133, 161, 0.14), 0 2px 6px 0 rgba(61, 46, 57, 0.04)`.
- **Level 2 (Featured Hero & Catalog Cards)**: Elevated floating effect with `0 14px 32px -6px rgba(255, 133, 161, 0.22), 0 4px 10px 0 rgba(61, 46, 57, 0.06)`.
- **Level 0 (Pressed / Tap State)**: `translateY(2px)` translation with compressed shadow `0 2px 8px rgba(61, 46, 57, 0.08)`, mimicking a soft gummy button depress.
- **Glass Accents**: Used selectively for sticky bottom quick-bars (`rgba(255, 249, 245, 0.85)` with `16px` backdrop blur).

## Shapes
Shapes express a hyper-soft, pillowy geometry. The design system uses pill-shaped foundations (`roundedness: 3`):
- Action buttons, badges, chips, and social media bubbles leverage `rounded-full` (capsule shapes).
- Large content cards, flipbook previews, and location sheets leverage `rounded-3xl` (`1.75rem` / `28px`).
- Circular avatars and brand icons carry a thick `3px` white stroke enclosure to frame the imagery cleanly against tinted backgrounds.

## Components

### Profile Header
- **Avatar**: 96px circular frame with a `4px` solid `#FFFFFF` border, elevated with Level 1 shadow.
- **Bio Box**: Centered layout, Comfortaa name heading with optional verified badge, followed by Quicksand body text and an active status pill (`Open Now` or `Online`) in `#4ECDC4`.

### Link & Action Buttons
- **Standard Link Button**: Full-width pill shape, minimum height `56px`. Pure white background with soft plum typography (`#3D2E39`), left icon embedded inside a circular pastel badge (`#FFD166`, `#4ECDC4`, or `#CDB4DB`), and subtle right chevron.
- **Hero CTA (WhatsApp)**: Mint background (`#4ECDC4`), pure white text, bold label, accompanied by pulsing online indicator bubble.
- **Catalog & Flipbook Showcase Card**: `rounded-3xl` card with top half displaying a 16:9 thumbnail preview with rounded-2xl interior corners, and bottom half containing title, summary tag, and a pill-shaped "Open Catalog" button in `#FF85A1`.

### Social Icon Ribbon
- Row of 44px circular or rounded-full squircle buttons in alternating soft pastel backdrops (`#FF85A1`, `#4ECDC4`, `#FFD166`, `#CDB4DB`) at 15% opacity, filled with full-saturation brand icons.

### Information Panels (Hours & Location)
- **Schedule Card**: Dual-column soft card with a clock icon badge, highlighting current business status (e.g., "Abierto hoy hasta 20:00") with tertiary `#FFD166` highlight accent.
- **Map & Location**: Integrated mini-map preview card with soft rounded corners (`rounded-2xl`), physical address, and a floating "Cómo llegar" pill link.

### Chips & Status Tags
- Height of 28px, pill-shaped (`rounded-full`), padded `space-xs` vertically and `space-md` horizontally. High-contrast typography set at `label-sm` weight 700.