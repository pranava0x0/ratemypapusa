# Issues Log

_Last updated: 2026-04-07_

---

## Open Issues

### [UAT-006] Custom-added spots are not visible to other sessions
- **Severity**: low
- **Complexity**: Medium — requires either session-scoped spots or a global spots table with approval
- **Prevalence**: Only affects multi-session usage of same spots
- **Priority**: Low
- **Page/Section**: `/session/[code]` > Add a Spot
- **Discovered**: 2026-04-07
- **Status**: open
- **Description**: Custom spots added via "Add a Spot" are stored globally in the `spots` table. This means spots added in one session appear in all sessions, and there's no session-scoping. This is technically working as designed but could lead to clutter if many sessions add test spots. Not a bug per se, but a design consideration for future — consider adding a `session_spots` junction table if session-scoped spots are desired.
- **Steps to Reproduce**:
  1. Add a custom spot in Session A
  2. Create Session B
  3. Observe the custom spot appears in Session B too
- **Fix**: _(pending — design decision)_

---

## Resolved Issues

### [UAT-001] Leaderboard shows medal badges and rank numbers for unrated spots
- **Severity**: low
- **Page/Section**: `/session/[code]` > Leaderboard tab
- **Discovered**: 2026-04-07
- **Resolved**: 2026-04-07
- **Status**: fixed
- **Root Cause**: Code bug — all spots rendered with sequential rank badges regardless of rating status.
- **Fix**: Separated rated and unrated spots in `Leaderboard.tsx`. Unrated spots now appear under a "Not Yet Rated" divider with a dash badge instead of numbered/medal ranks.

---

### [UAT-002] No dedicated leaderboard route — tab state resets on navigation
- **Severity**: low
- **Page/Section**: `/session/[code]`
- **Discovered**: 2026-04-07
- **Resolved**: 2026-04-07
- **Status**: fixed
- **Root Cause**: Code bug — tab state was React-only, not persisted in URL.
- **Fix**: Added `?tab=leaderboard` URL search param support in `app/session/[code]/page.tsx`. Tab state is read from and written to the URL, so it survives navigation.

---

### [UAT-003] Rate page "Not found" state is sparse compared to session error state
- **Severity**: low
- **Page/Section**: `/session/[code]/rate/[invalid-spotId]`
- **Discovered**: 2026-04-07
- **Resolved**: 2026-04-07
- **Status**: fixed
- **Root Cause**: Code bug — minimal fallback JSX in rate page.
- **Fix**: Updated not-found state in `rate/[spotId]/page.tsx` to match session error page: added emoji, descriptive message, and styled "Go Back" button.

---

### [UAT-004] No "Back to home" or "New session" link from session dashboard
- **Severity**: low
- **Page/Section**: `/session/[code]`
- **Discovered**: 2026-04-07
- **Resolved**: 2026-04-07
- **Status**: fixed
- **Root Cause**: Code bug — no navigation link back to home existed.
- **Fix**: Added a home link with the papusa emoji and "RateMyPapusa" text in `SessionHeader.tsx` that links to `/`.

---

### [UAT-005] Toast notification for rating says factor name in lowercase
- **Severity**: low
- **Page/Section**: `/session/[code]/rate/[spotId]`
- **Discovered**: 2026-04-07
- **Resolved**: 2026-04-07
- **Status**: fixed
- **Root Cause**: Code bug — raw factor key used instead of label from `RATING_FACTORS`.
- **Fix**: In `rate/[spotId]/page.tsx`, toast now uses `RATING_FACTORS.find(f => f.key === factor)?.label` instead of the raw key string.
