# UAT Baseline — RateMyPupusa

_Created: 2026-04-07_
_Last run: 2026-04-08_

## Project Info
- **Stack**: Next.js 16 (App Router) + Tailwind v4 + TypeScript + Supabase
- **Live URL**: https://ratemypupusa.vercel.app
- **Dev server**: `npm run dev` → http://localhost:3000
- **Entry point**: `app/page.tsx`
- **Key routes**:
  - `/` — Landing (create/join session)
  - `/session/[code]` — Session dashboard (spots + leaderboard)
  - `/session/[code]/rate/[spotId]` — Rate a spot

## Critical Flows (run every time)

1. **Create Session**: Landing → "Start New Session" → fill name + your name → "Create Session" → redirects to `/session/[code]` with share code, 1 taster, 12 spots listed.
2. **Rate a Spot**: Session dashboard → click spot card → rate all 6 factors → each auto-saves with toast + Avg display → "Done" → back to dashboard with score showing on card.
3. **Leaderboard**: Session dashboard → "Leaderboard" tab → rated spots ranked at top with score + expand for per-factor breakdown.
4. **Join Session**: Landing → "Join Session" → enter code + name → lands on session dashboard with join name prompt if needed.
5. **Add Custom Spot**: Session dashboard → scroll to bottom → "+ Add a Spot" → fill name → "Add Spot" → spot appears at bottom of list.
6. **Invalid Session**: Navigate to `/session/ZZZZZ` → "Session not found" error with "Go Home" button.

## Sections & Last Tested
| Section | Last Tested | Notes |
|---------|-------------|-------|
| Landing page | 2026-04-08 | Stable — clean layout at all viewports |
| Create session form | 2026-04-08 | Stable — validation works, redirect correct |
| Session dashboard | 2026-04-08 | Stable — 12 spots, share code, tabs, URL param persists |
| Rate spot page | 2026-04-08 | Stable — text stacked below stars, no wrapping (UAT-008 fixed) |
| Leaderboard tab | 2026-04-08 | Stable — ranked/unrated separation, expand/collapse works |
| Add a Spot modal | 2026-04-08 | Stable — bottom sheet positioning correct on mobile |
| Invalid session route | 2026-04-08 | Stable — proper error state |
| Invalid spot route | 2026-04-08 | Stable — matched session error styling (UAT-003 fixed) |
| Copy/Share buttons | 2026-04-08 | Stable — clipboard/share errors caught (UAT-009 fixed) |

## Known Stable Areas
- Landing page (all viewports)
- Create session flow end-to-end
- Star rating component interaction
- Leaderboard expand/collapse with per-person/per-factor breakdown
- Add a Spot modal (bottom sheet on mobile, centered on desktop)
- Error states for invalid routes (session + spot)
- Tab URL param persistence (UAT-002 fixed)
- Rate page factor rows at all viewport widths (UAT-008 fixed)
- Clipboard/Share error handling (UAT-009 fixed)
- New user display name prompt (UAT-007 fixed)

## Known Flaky / Unstable Areas
- None currently known

## Exploration Notes
- The app is inherently mobile-first (max-width 480px container), so responsive behavior is good by default
- Tab state now persists via URL search param `?tab=leaderboard` (UAT-002 resolved)
- Supabase realtime channels use `Date.now()` suffix to avoid React Strict Mode double-mount conflicts
- Star hover state can sometimes visually bleed to adjacent factor rows — could not consistently reproduce, monitor in future runs
- Console warnings: Next.js Image aspect ratio warning on pupusa.png (UAT-010)
- Toast system works correctly — appears for each rating and for spot additions
- 4 rating factors confirmed: Taste, Value, Curtido, Other (was 6 in previous UAT notes — actually 4)
- New users now prompted for display name after OTP (UAT-007 fixed)
