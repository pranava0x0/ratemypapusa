# RateMyPupusa — Design System

## Visual Theme & Atmosphere

RateMyPupusa is a warm, inviting app that celebrates Salvadoran street food culture. The design evokes the feeling of walking through DC's pupusa corridor — warm tortilla tones, vibrant salsa reds, and curtido greens. The aesthetic is casual and communal, matching the act of eating pupusas with friends and debating which spot reigns supreme.

Key characteristics:
- **Warm color temperature** — golden yellows, burnt oranges, and earthy browns
- **Friendly typography** — clean sans-serif with generous sizing for mobile readability
- **Card-based layout** — each pupusa spot is a tactile card you interact with
- **Communal energy** — participant avatars, live score updates, shared leaderboards

---

## Color Palette & Roles

### Primary
| Name | Hex | Usage |
|------|-----|-------|
| Pupusa Gold | `#F59E0B` | Primary actions, star ratings, active states |
| Pupusa Orange | `#EA580C` | Accent highlights, top rankings, CTAs |
| Masa Cream | `#FEF3C7` | Card backgrounds, warm surfaces |

### Secondary & Accent
| Name | Hex | Usage |
|------|-----|-------|
| Curtido Green | `#16A34A` | High scores (4+), success states |
| Salsa Red | `#DC2626` | Low scores (<3), error states |
| Chicharrón Brown | `#92400E` | Headings, strong text |

### Surface & Background
| Name | Hex | Usage |
|------|-----|-------|
| Warm White | `#FFFBEB` | Page background |
| Tortilla Light | `#FEF9EE` | Card surface |
| Tortilla Border | `#FDE68A` | Card borders, dividers |

### Neutrals & Text
| Name | Hex | Usage |
|------|-----|-------|
| Dark Text | `#1C1917` | Primary text (stone-900) |
| Medium Text | `#57534E` | Secondary text (stone-600) |
| Light Text | `#A8A29E` | Placeholder text (stone-400) |

### Semantic
| Name | Hex | Usage |
|------|-----|-------|
| Score High | `#16A34A` | Scores ≥ 4.0 |
| Score Mid | `#CA8A04` | Scores 3.0–3.9 |
| Score Low | `#DC2626` | Scores < 3.0 |

---

## Typography Rules

### Font Family
- **Primary**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`
- **Monospace** (share codes): `JetBrains Mono`, `SF Mono`, `Consolas`, `monospace`

### Hierarchy

| Role | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| Display | 36px | 700 | 1.1 | -0.02em | Landing hero text |
| Heading 1 | 28px | 700 | 1.2 | -0.01em | Page titles |
| Heading 2 | 22px | 600 | 1.3 | -0.01em | Section titles |
| Heading 3 | 18px | 600 | 1.4 | 0 | Card titles, spot names |
| Body Large | 16px | 400 | 1.5 | 0 | Primary body text |
| Body | 14px | 400 | 1.5 | 0 | Secondary body text |
| Caption | 12px | 500 | 1.4 | 0.01em | Labels, metadata |
| Score | 32px | 700 | 1 | -0.02em | Aggregate score display |
| Share Code | 28px | 600 | 1 | 0.15em | Session share code |

---

## Component Stylings

### Buttons

**Primary (Gold)**
- Background: `#F59E0B`
- Text: `#1C1917`
- Border radius: `12px`
- Padding: `12px 24px`
- Font: 16px / 600
- Hover: `#D97706`
- Active: `#B45309`
- Shadow: `0 2px 8px rgba(245, 158, 11, 0.3)`

**Secondary (Outline)**
- Background: transparent
- Border: `2px solid #FDE68A`
- Text: `#92400E`
- Hover background: `#FEF3C7`

**Ghost**
- Background: transparent
- Text: `#92400E`
- Hover: underline

### Cards (Spot Cards)

- Background: `#FEF9EE`
- Border: `1px solid #FDE68A`
- Border radius: `16px`
- Padding: `16px`
- Shadow: `0 1px 3px rgba(0, 0, 0, 0.05)`
- Hover shadow: `0 4px 12px rgba(245, 158, 11, 0.15)`
- Transition: `all 200ms ease`

### Star Rating

- Inactive star: `#D6D3D1` (stone-300)
- Active star: `#F59E0B` (Pupusa Gold)
- Hover star: `#FBBF24` (amber-400)
- Size: `32px` (interactive), `20px` (readonly display)
- Tap target: minimum `44px × 44px`
- Transition: `transform 150ms ease, color 150ms ease`
- Active animation: scale `1.2` then `1.0`

### Share Code Display

- Font: `JetBrains Mono` / 28px / 600
- Letter spacing: `0.15em`
- Background: `#FEF3C7`
- Border: `2px dashed #FDE68A`
- Border radius: `12px`
- Padding: `16px 24px`
- Text align: center

### Leaderboard Row

- Rank badge (top 3): `32px` circle with gold/silver/bronze gradient
- Rank badge (4+): plain number
- Score: `32px` bold, color-coded by value
- Expandable factor breakdown: slide-down animation `300ms ease`

---

## Layout Principles

### Spacing Scale
| Token | Value |
|-------|-------|
| `xs` | `4px` |
| `sm` | `8px` |
| `md` | `16px` |
| `lg` | `24px` |
| `xl` | `32px` |
| `2xl` | `48px` |

### Grid & Container
- Max width: `480px` (single column, mobile-first)
- Page padding: `16px` horizontal
- Card gap: `12px`

### Whitespace
- Generous vertical spacing between sections (`32px+`)
- Cards have comfortable internal padding (`16px`)
- Never let content touch edges — minimum `16px` inset

### Border Radius Scale
| Usage | Value |
|-------|-------|
| Buttons | `12px` |
| Cards | `16px` |
| Inputs | `12px` |
| Badges | `9999px` (full round) |
| Modal | `20px` top corners |

---

## Depth & Elevation

| Level | Shadow | Usage |
|-------|--------|-------|
| Flat | none | Inline elements, text |
| Subtle | `0 1px 3px rgba(0,0,0,0.05)` | Cards at rest |
| Raised | `0 4px 12px rgba(245,158,11,0.15)` | Cards on hover, active elements |
| Modal | `0 8px 30px rgba(0,0,0,0.12)` | Modals, bottom sheets |

---

## Do's and Don'ts

### Do
- Use warm amber/orange as the dominant color family
- Keep typography clean and large for mobile readability
- Use card-based layouts for spot listings
- Show scores prominently with color coding
- Use generous touch targets (44px minimum)
- Animate score changes subtly for real-time feel
- Show participant count and names for social proof
- Use emoji alongside factor labels for quick scanning

### Don't
- Don't use cool blues or grays as primary colors
- Don't use font sizes below 12px
- Don't show empty states without helpful guidance
- Don't hide the share code — it should always be accessible
- Don't use complex navigation — keep it flat and simple
- Don't require scrolling to find the primary action
- Don't use dark mode (the warm palette is the identity)
- Don't use decorative animations that slow interaction

---

## Responsive Behavior

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px | Single column, full-width cards, bottom sheet modals |
| Tablet | 640–1024px | Single column with wider max-width (540px) |
| Desktop | > 1024px | Centered container (480px), more whitespace |

### Touch Targets
- All interactive elements: minimum `44px × 44px`
- Star rating stars: `44px` tap zone even if visual is `32px`
- Buttons: full-width on mobile, auto-width on tablet+

### Mobile Keyboard
- Use `dvh` units for full-height layouts
- Sticky submit buttons above keyboard
- Auto-scroll inputs into view on focus

---

## Agent Prompt Guide

### Quick Color Reference
- Primary gold: `#F59E0B`
- Orange accent: `#EA580C`
- Cream surface: `#FEF3C7`
- Warm white bg: `#FFFBEB`
- Brown heading: `#92400E`
- Border gold: `#FDE68A`

### Example Component Prompts

**Spot Card:**
"A warm cream card (#FEF9EE) with 1px #FDE68A border, 16px border-radius, 16px padding. Spot name in 18px/600 #92400E. Address in 14px/400 #57534E. Gold star score badge on the right."

**Star Rating:**
"5 stars in a row, each 32px, inactive #D6D3D1, active #F59E0B. 44px tap targets. Scale animation on tap. Left-to-right fill."

**Leaderboard:**
"Ranked list. Top 3 get medal circles (gold #F59E0B, silver #A8A29E, bronze #92400E). Score in 32px bold, color-coded. Expandable rows showing per-factor breakdown."
