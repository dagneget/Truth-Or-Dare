---
name: Electric Social
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e2bdcb'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#a98895'
  outline-variant: '#5a3f4a'
  surface-tint: '#ffafd2'
  primary: '#ffafd2'
  on-primary: '#63003f'
  primary-container: '#ff41af'
  on-primary-container: '#570037'
  inverse-primary: '#b60078'
  secondary: '#ffffff'
  on-secondary: '#003737'
  secondary-container: '#00fbfb'
  on-secondary-container: '#007070'
  tertiary: '#e4b5ff'
  on-tertiary: '#4e0078'
  tertiary-container: '#c265ff'
  on-tertiary-container: '#44006a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffd8e7'
  primary-fixed-dim: '#ffafd2'
  on-primary-fixed: '#3d0025'
  on-primary-fixed-variant: '#8b005b'
  secondary-fixed: '#00fbfb'
  secondary-fixed-dim: '#00dddd'
  on-secondary-fixed: '#002020'
  on-secondary-fixed-variant: '#004f4f'
  tertiary-fixed: '#f4d9ff'
  tertiary-fixed-dim: '#e4b5ff'
  on-tertiary-fixed: '#2f004b'
  on-tertiary-fixed-variant: '#6f00a9'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-xl:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Spline Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Spline Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin-mobile: 20px
---

## Brand & Style

This design system is engineered to capture the high-stakes adrenaline of a late-night club atmosphere combined with the high-production value of a modern televised game show. The personality is daring, social, and relentlessly energetic. It targets a Gen-Z and Millennial audience looking for a digital center-piece to their social gatherings.

The visual style is a hybrid of **Glassmorphism** and **High-Contrast/Bold** design. It utilizes deep, immersive backgrounds to make neon elements "pop" as if they were physical LED signage. Surfaces are semi-transparent with heavy backdrop blurs to simulate frosted acrylic, while interactions are defined by radiant glows and sharp, vibrant borders. Every touchpoint should feel like a trigger for a celebration, using light and color to drive the emotional rhythm of the game.

## Colors

The palette is built on a foundation of absolute darkness to maximize the luminosity of the accent colors. 

- **Primary (Neon Pink):** Used for "Dare" actions, high-energy alerts, and primary calls to action.
- **Secondary (Neon Blue):** Used for "Truth" actions, information states, and secondary interactive elements.
- **Tertiary (Neon Purple):** Used for navigational elements, background gradients, and premium features.
- **Electric Green:** Reserved specifically for "Success" states, active players, and "Go" prompts.

Gradients are used aggressively, typically transitioning from a brand accent to a deeper version of itself or into the Tertiary Purple to create a sense of movement and light-bleed.

## Typography

This design system utilizes **Space Grotesk** for all high-impact messaging. Its geometric, slightly technical DNA fits the futuristic nightclub aesthetic perfectly. For display text, tight tracking and heavy weights are required to mimic the "boldness" of game show title cards.

**Spline Sans** is employed for body copy to maintain readability during fast-paced play. It offers a friendly, energetic counterpoint to the rigid headlines. All labels and buttons use Space Grotesk in uppercase to ensure they feel like definitive commands rather than mere suggestions.

## Layout & Spacing

The layout follows a **Fluid Grid** model designed for one-handed mobile use, as players will likely be in a social environment. We use an 8px base unit to maintain a tight, rhythmic spacing system.

Margins are generous on the horizontal axis (20px) to prevent interactive elements from feeling cramped against the device edges. Vertical spacing is used to create "zones" of activity—grouping player information tightly while providing significant "breathing room" (xl spacing) around the central game card to focus attention on the current prompt.

## Elevation & Depth

Depth is not communicated through traditional grey shadows, but through **Luminescent Layering** and **Glassmorphism**. 

1.  **Level 0 (Background):** Deep Dark (#0a0a0a) with subtle, large-scale radial blurs of Purple and Blue in the corners to simulate ambient club lighting.
2.  **Level 1 (Surface):** Semi-transparent panels (15-20% opacity) with a 20px backdrop blur and a 1px solid neon stroke.
3.  **Level 2 (Active/Floating):** Higher opacity glass with an outer glow (10px to 20px spread) matching the stroke color.

Transitions between levels should feel like lights turning on; when a card is selected, its border glow should intensify while the background darkens further.

## Shapes

The design system uses a **Rounded** (Level 2) shape language. This provides a balance between the "friendly/social" aspect of the game and the "slick/modern" feel of a nightclub.

- **Standard Buttons & Inputs:** 0.5rem (8px) corner radius.
- **Main Game Cards:** 1.5rem (24px) corner radius to make them feel like distinct, touchable objects.
- **Player Avatars:** Perfectly circular to contrast against the rectangular grid and cards.

Strokes are always consistent at 1.5px or 2px—never hairline—to ensure they carry enough color to appear as though they are "glowing."

## Components

### Buttons
Buttons are the primary drivers of energy.
- **Primary (Dare):** Solid Neon Pink to Purple gradient with a white uppercase label. On tap, it emits a pink ripple effect.
- **Secondary (Truth):** Neon Blue outline with a glass-fill. On tap, the fill becomes solid blue.
- **Ghost:** Text-only with a heavy underline that glows on hover/active states.

### Cards
The central game card is the hero component. It features a 2px Neon Purple border, a deep glassmorphic background, and a subtle "scanline" overlay pattern to enhance the game show feel.

### Input Fields
Inputs are dark with a subtle 1px gray border that transitions to a full Neon Cyan glow when focused. The cursor should be the same neon color as the focus border.

### Chips & Tags
Used for categories (e.g., "Spicy," "Funny," "Extreme"). These are small, pill-shaped elements with high-saturation backgrounds and black text for maximum legibility.

### Progress Bars
Represented as "LED Strips." Instead of a smooth fill, they are segmented into small blocks that light up individually as the timer runs down, changing from Electric Green to Neon Pink as time expires.