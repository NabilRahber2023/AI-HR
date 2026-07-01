---
name: Cognitive Analytics System
colors:
  surface: '#13121b'
  surface-dim: '#13121b'
  surface-bright: '#393842'
  surface-container-lowest: '#0e0d16'
  surface-container-low: '#1b1b24'
  surface-container: '#1f1f28'
  surface-container-high: '#2a2933'
  surface-container-highest: '#35343e'
  on-surface: '#e4e1ee'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#e4e1ee'
  inverse-on-surface: '#302f39'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb695'
  on-tertiary: '#571f00'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#13121b'
  on-background: '#e4e1ee'
  surface-variant: '#35343e'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 32px
  gutter: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system is engineered for a high-stakes HR Research environment where data integrity meets cutting-edge machine learning. The aesthetic is a fusion of **Modern Minimalism** and **Glassmorphism**, drawing inspiration from top-tier engineering brands like Linear and Apple. 

The emotional goal is to evoke **Engineering Excellence** and **Research Rigor**. It achieves this through a high-fidelity dark-mode interface that prioritizes clarity, utilizing translucent layers and subtle gradients to suggest depth and computational complexity without cluttering the researcher's workspace.

## Colors

The palette is anchored in **Deep Slate (#0F172A)** and **Charcoal**, creating a "void" background that allows data visualizations to pop. 

- **AI Indigo (#4F46E5):** Used for primary actions, active AI states, and focus indicators. It represents the "intelligence" layer of the system.
- **Success Emerald (#10B981):** Reserved for positive growth metrics, completed research benchmarks, and system health status.
- **Surface Palette:** Layers are built using varying opacities of slate. The background uses a solid deep slate, while floating panels use a semi-transparent charcoal with a backdrop blur.

## Typography

The typography system relies on **Inter** for its global accessibility and clinical precision. For technical data points and labels, **Geist** is introduced to provide a "developer-focused" aesthetic that reinforces the engineering nature of the project.

- **Tracking:** Headlines feature tight tracking (-0.02em) for a compact, authoritative look. Labels and small metadata use expanded tracking (0.05em) to ensure legibility on dark backgrounds.
- **Hierarchy:** Use font weight rather than size to distinguish information tiers in dense data views.

## Layout & Spacing

The layout follows a **Fixed Grid** approach for research dashboards to maintain data visualization integrity, switching to a **Fluid Grid** for document-heavy research papers.

- **Grid Model:** 12-column desktop grid with a 1200px max-width container. 
- **Rhythm:** An 8px linear scale (referenced as units of 4px) governs all spacing.
- **Responsive Behavior:** On mobile, margins reduce to 16px and columns collapse to a single stack. On tablet, a 6-column grid is utilized to maintain density.

## Elevation & Depth

This design system uses **Glassmorphism** to convey hierarchy. Depth is not created through heavy shadows, but through physical stacking metaphors:

1.  **Level 0 (Base):** Solid `#0F172A`.
2.  **Level 1 (Cards/Panels):** Background blur (20px) with a 40% opacity fill of `#1E293B`. A 1px border of `rgba(255, 255, 255, 0.1)` creates a "glass edge."
3.  **Level 2 (Modals/Popovers):** Background blur (40px) with a 60% opacity fill. Elevated by a 24px soft ambient shadow with a 0% offset and 10% Indigo tint.

## Shapes

The shape language is sophisticated and approachable. All primary containers use **Large Rounded Corners (1rem / 16px)**, while top-level dashboard widgets and modal containers use **Extra Large (1.5rem / 24px)**. 

- Small elements like buttons or tags use a base 8px radius.
- Interactive elements should feel "pill-like" only when used for status indicators or chips.

## Components

- **Buttons:** Primary buttons feature a subtle gradient from AI Indigo to a slightly darker shade. Secondary buttons use the "glass" style (blur + border) with no fill.
- **Data Cards:** Cards must include a 1px top-light border to simulate a light source from above. Backgrounds should be translucent to allow underlying gradients to peek through.
- **Input Fields:** Use a dark, recessed fill with a 1px border that glows AI Indigo upon focus. Monospaced font (Geist) is preferred for numerical data entry.
- **AI Insight Chips:** Specialized components with a Success Emerald pulse animation to indicate "Live Research" or "AI-Generated" content.
- **Progress Bars:** Use a dual-tone gradient. The background track is a dark slate, while the progress fill is a vibrant Indigo-to-Emerald horizontal gradient.