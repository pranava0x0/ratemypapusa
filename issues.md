# Issues Log

_Last updated: 2026-05-12_

---

## Open Issues

### [UAT-010] Next.js Image component warns about aspect ratio on pupusa.png
- **Severity**: low
- **Complexity**: Low — add `style={{ height: 'auto' }}` to both Image components
- **Prevalence**: Every page load (console warning)
- **Priority**: Low — cosmetic console warning, no visual impact
- **Page/Section**: `/` (hero image) and `/session/[code]` (header logo)
- **Discovered**: 2026-04-08
- **Status**: open
- **Description**: `app/page.tsx:66` uses `<Image src="/pupusa.png" width={240} height={150}>` and `SessionHeader.tsx:60` uses `width={24} height={15}`. Next.js 16 warns: "Image with src '/pupusa.png' has either width or height modified, but not the other. Include 'width: auto' or 'height: auto' to maintain aspect ratio." The image renders correctly but logs a console warning on every page load.
- **Steps to Reproduce**:
  1. Open any page with pupusa.png
  2. Check browser console
  3. See repeated warning about aspect ratio
- **Fix**: _(pending)_

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

### [UAT-014] Production OTP sending failed due to paused Supabase project
- **Severity**: critical
- **Page/Section**: `/` — phone auth (Send Code)
- **Discovered**: 2026-05-12
- **Resolved**: 2026-05-12
- **Status**: fixed
- **Root Cause**: Infrastructure — Supabase free-tier projects auto-pause after ~1 week of inactivity. DNS for `fbjnafeamrmejporunjn.supabase.co` stopped resolving, so every Vercel serverless call failed with `TypeError: fetch failed / getaddrinfo`. This surfaced as "Failed to send verification code" in the UI.
- **Fix**: Restored the project via the Supabase dashboard (Project Settings → Resume project). To prevent recurrence: keep the project active with regular traffic, or upgrade to Supabase Pro.

---

### [UAT-013] Auth loading spinner stuck when Supabase can't refresh a stale token
- **Severity**: critical
- **Page/Section**: `/` — create and join crawl flows
- **Discovered**: 2026-05-11
- **Resolved**: 2026-05-11
- **Status**: fixed
- **Root Cause**: Code bug — `useAuth.ts` had no `.catch()` on `supabase.auth.getUser()` and no timeout. When the Supabase client tries to `_recoverAndRefresh` a stale token and hits a network error, it enters an internal retry loop that never rejects — so `setLoading(false)` was never called, trapping the user on the spinner indefinitely.
- **Fix**: Added `.catch()` + `.finally()` to the `getUser()` chain in `lib/hooks/useAuth.ts` to guarantee `setLoading(false)` fires on any error. Added an 8s `setTimeout` safety net for the case where `getUser()` hangs in the Supabase retry loop without ever rejecting. After 8s, `authLoading` resolves to `false` and the user sees the phone auth form.

---

### [UAT-012] Leaderboard component tests used stale interface and wrong factor list
- **Severity**: high
- **Page/Section**: `__tests__/components/Leaderboard.test.tsx`
- **Discovered**: 2026-05-11
- **Resolved**: 2026-05-11
- **Status**: fixed
- **Root Cause**: Test bug — tests used `totalParticipants: number` (old prop) instead of `participants: Participant[]` and `ratings: Rating[]`. Also referenced 6 obsolete rating factors instead of the 4 current ones (`taste`, `value`, `curtido`, `other`). Empty state assertion expected "No ratings yet" but component renders "No spots yet". All 7 Leaderboard tests were failing.
- **Fix**: Rewrote `__tests__/components/Leaderboard.test.tsx` to use correct props and factor list. All 7 tests now pass.

---

### [UAT-011] Create/join crawl form renders prematurely during auth loading
- **Severity**: high
- **Page/Section**: `/` (home page, create and join flows)
- **Discovered**: 2026-05-11
- **Resolved**: 2026-05-11
- **Status**: fixed
- **Root Cause**: Code bug — `needsAuth = !authLoading && !user` and `needsName = !authLoading && !!user && !profile?.display_name` both evaluate to `false` when `authLoading=true` (initial state). This caused the create/join form to appear immediately, before `getUser()` resolved. Users clicking "Create Crawl" at this moment would have `user?.id=undefined`, causing Supabase RLS to reject the insert with "Failed to create crawl."
- **Fix**: Added an `authLoading` spinner guard in `app/page.tsx` between the `needsAuth` and `needsName` checks in both the create and join flow blocks. The form now waits until auth resolves before showing.

---

### [UAT-008] "Tap to rate" / "You: X/5" text wraps awkwardly on narrow viewports (375px–393px)
- **Severity**: medium
- **Page/Section**: `/session/[code]/rate/[spotId]` > rating factor rows
- **Discovered**: 2026-04-08
- **Resolved**: 2026-04-08
- **Status**: fixed
- **Root Cause**: Code bug — stars and hint text shared a single `flex justify-between` row, leaving insufficient space for text at narrow widths.
- **Fix**: Changed layout to stack hint text ("Tap to rate" / "You: X/5") below the stars instead of beside them. Also refactored other-participant rows to show name+score on one line with stars below. Eliminates wrapping at all viewport widths.

---

### [UAT-009] Clipboard writeText throws unhandled rejection when permission denied
- **Severity**: medium
- **Page/Section**: `/session/[code]` > Copy/Share buttons in `SessionHeader.tsx` and `ShareCode.tsx`
- **Discovered**: 2026-04-08
- **Resolved**: 2026-04-08
- **Status**: fixed
- **Root Cause**: Code bug — `navigator.clipboard.writeText()` and `navigator.share()` called without try/catch.
- **Fix**: Wrapped both `handleCopy()` and `handleShare()` in try/catch in `SessionHeader.tsx` and `ShareCode.tsx`. Clipboard failures (NotAllowedError) and share dismissals (AbortError) are now silently caught.

---

### [UAT-007] New users are never prompted for a display name before create/join
- **Severity**: medium
- **Page/Section**: `/` (home page, both create and join flows)
- **Discovered**: 2026-04-08
- **Resolved**: 2026-04-08
- **Status**: fixed
- **Root Cause**: Code bug — `app/page.tsx` never checked for missing display name after OTP verification. `updateProfile` was imported but never called.
- **Fix**: Added `needsName` check (`user` exists but `profile.display_name` is empty). Both create and join flows now show a "What should we call you?" name input step between OTP verification and the session form. Calls `updateProfile()` to save the name, then proceeds to the session form with greeting.

---

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
- **Fix**: Added a home link with the pupusa emoji and "RateMyPupusa" text in `SessionHeader.tsx` that links to `/`.

---

### [UAT-005] Toast notification for rating says factor name in lowercase
- **Severity**: low
- **Page/Section**: `/session/[code]/rate/[spotId]`
- **Discovered**: 2026-04-07
- **Resolved**: 2026-04-07
- **Status**: fixed
- **Root Cause**: Code bug — raw factor key used instead of label from `RATING_FACTORS`.
- **Fix**: In `rate/[spotId]/page.tsx`, toast now uses `RATING_FACTORS.find(f => f.key === factor)?.label` instead of the raw key string.
