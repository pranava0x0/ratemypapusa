# UAT Baseline — RateMyPapusa

_Created: 2026-04-07_
_Last run: 2026-04-07_

## Project Info
- **Stack**: Next.js 16 (App Router) + Tailwind v4 + TypeScript + Supabase
- **Live URL**: https://ratemypapusa.vercel.app
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
| Landing page | 2026-04-07 | Stable — clean layout, both CTAs work |
| Create session form | 2026-04-07 | Stable — validation works, redirect correct |
| Session dashboard | 2026-04-07 | Stable — 12 spots, share code, tabs |
| Rate spot page | 2026-04-07 | Stable — all 6 factors, auto-save, toasts |
| Leaderboard tab | 2026-04-07 | Works — minor issue with unrated spot badges (UAT-001) |
| Add a Spot modal | 2026-04-07 | Stable — adds spot, closes modal |
| Invalid session route | 2026-04-07 | Stable — proper error state |
| Invalid spot route | 2026-04-07 | Works — sparse error treatment (UAT-003) |

## Known Stable Areas
- Landing page (desktop)
- Create session flow end-to-end
- Star rating component interaction
- Leaderboard expand/collapse
- Add a Spot modal
- Error states for invalid routes

## Known Flaky / Unstable Areas
- None observed in first run

## Exploration Notes
- The app is inherently mobile-first (max-width 480px container), so responsive behavior is good by default
- Tab state on session dashboard is React-only — doesn't persist across navigations (UAT-002)
- Supabase realtime channels use `Date.now()` suffix to avoid React Strict Mode double-mount conflicts
- Star hover state can sometimes visually bleed to adjacent factor rows — could not consistently reproduce, monitor in future runs
- Console was clean on production (no errors observed during UAT)
- Toast system works correctly — appears for each rating and for spot additions
