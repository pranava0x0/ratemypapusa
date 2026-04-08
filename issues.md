# Issues Log

_Last updated: 2026-04-07_

---

## Open Issues

### [UAT-001] Leaderboard shows medal badges and rank numbers for unrated spots
- **Severity**: low
- **Complexity**: Low — single conditional in `Leaderboard.tsx`
- **Prevalence**: Always visible when any spots are unrated (nearly every session)
- **Priority**: Medium
- **Page/Section**: `/session/[code]` > Leaderboard tab
- **Discovered**: 2026-04-07
- **Status**: open
- **Description**: Unrated spots (0 raters) receive rank numbers including gold (#2), silver (#3), and bronze (#4) medal badges even though they have no scores. They should either not display rank badges at all or be grouped under a separate "Not Yet Rated" section below the ranked spots.
- **Steps to Reproduce**:
  1. Create a session
  2. Rate only 1 spot
  3. Switch to Leaderboard tab
  4. Observe unrated spots #2-#12 show rank badges with medal colors
- **Fix**: _(pending)_ — In `Leaderboard.tsx`, conditionally hide rank badges or suppress medal colors when `agg.overallAverage === null`. Consider grouping unrated spots under a "Not Yet Rated" divider.

---

### [UAT-002] No dedicated leaderboard route — tab state resets on navigation
- **Severity**: low
- **Complexity**: Low — add route or persist tab state in URL param
- **Prevalence**: Every time user navigates away and back to session dashboard
- **Priority**: Low
- **Page/Section**: `/session/[code]`
- **Discovered**: 2026-04-07
- **Status**: open
- **Description**: The Leaderboard/Rate Spots tab state is managed in React state only. If a user is on the Leaderboard tab, clicks a spot to rate it, then hits "Done" to return, the tab resets to "Rate Spots". The plan included a `/session/[code]/leaderboard` route but it was consolidated into a tab instead. Either persist tab selection in a URL query param (`?tab=leaderboard`) or add the dedicated route.
- **Steps to Reproduce**:
  1. Go to session dashboard
  2. Click "Leaderboard" tab
  3. Click "Rate Spots" tab, click a spot to rate
  4. Click "Done" — returns to Rate Spots tab (not leaderboard)
- **Fix**: _(pending)_ — Add `?tab=leaderboard` URL param support, or store last-active tab in localStorage.

---

### [UAT-003] Rate page "Not found" state is sparse compared to session error state
- **Severity**: low
- **Complexity**: Trivial — add emoji and descriptive text to the existing fallback JSX
- **Prevalence**: Only when navigating to invalid spot IDs directly
- **Priority**: Low
- **Page/Section**: `/session/[code]/rate/[invalid-spotId]`
- **Discovered**: 2026-04-07
- **Status**: open
- **Description**: When navigating to an invalid spot ID, the rate page shows a minimal "Not found" message and "Go back" text link. The session-not-found error page has a much richer treatment (emoji, explanation, styled button). The rate page should match.
- **Steps to Reproduce**:
  1. Navigate to `/session/7BCFH/rate/invalid-id`
  2. Observe sparse "Not found" + "Go back" text
- **Fix**: _(pending)_ — Add emoji, descriptive message, and styled "Go Back" button in `rate/[spotId]/page.tsx` error state to match the session error treatment.

---

### [UAT-004] No "Back to home" or "New session" link from session dashboard
- **Severity**: low
- **Complexity**: Trivial — add a link in `SessionHeader.tsx`
- **Prevalence**: Every session — user has to manually edit URL to return home
- **Priority**: Medium
- **Page/Section**: `/session/[code]`
- **Discovered**: 2026-04-07
- **Status**: open
- **Description**: The session dashboard has no navigation link back to the home page. Once in a session, the only way to start a new session or return home is to manually edit the URL or use browser back. There should be a home/logo link or a "New Session" action somewhere accessible.
- **Steps to Reproduce**:
  1. Create a session and land on the dashboard
  2. Try to navigate back to `/ ` — no link exists
- **Fix**: _(pending)_ — Make the 🫓 emoji or "RateMyPapusa" title a link to `/` in the layout, or add a home icon to `SessionHeader.tsx`.

---

### [UAT-005] Toast notification for rating says factor name in lowercase
- **Severity**: low
- **Complexity**: Trivial — capitalize the factor name string
- **Prevalence**: Every rating interaction (6 times per spot per user)
- **Priority**: Low
- **Page/Section**: `/session/[code]/rate/[spotId]`
- **Discovered**: 2026-04-07
- **Status**: open
- **Description**: When rating a factor, the toast says "taste rated!" instead of "Taste rated!". The factor key string is used directly without capitalizing. Should use the factor label from `RATING_FACTORS` instead.
- **Steps to Reproduce**:
  1. Rate any factor on any spot
  2. Observe toast: "taste rated!" (lowercase)
- **Fix**: _(pending)_ — In `rate/[spotId]/page.tsx`, use the factor's `label` from `RATING_FACTORS.find(f => f.key === factor)?.label` instead of the raw key.

---

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

_(none yet)_
