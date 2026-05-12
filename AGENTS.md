<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Mobile-first development

This app targets iPhones as the primary device. All UI changes must be tested for:
- iPhone SE (375px width)
- iPhone 16 (393px width)
- iPhone Pro Max (430px width)

The app uses a 480px max-width container with 16px horizontal padding. Ensure:
- Text truncates rather than overflows (use Tailwind `truncate` class)
- Touch targets are at least 44px on touch devices
- Safe area insets are respected (notch/dynamic island)
- No horizontal scroll on any screen size

When adding or modifying components, add or update tests in `__tests__/components/MobileResponsive.test.tsx` to verify content renders without overflow.

# Dev testing with test phone numbers

Supabase Auth has two test phone numbers configured to bypass Twilio SMS in development:

| Phone Number | OTP Code | Use Case |
|---|---|---|
| `5555550101` | `123456` | Session creator (User A) |
| `5555550102` | `123456` | Session joiner (User B) |

These are configured in Supabase Dashboard > Authentication > Providers > Phone > "Test Phone Numbers and OTPs" and are valid until April 2027. They bypass Twilio Verify entirely so no SMS credits are consumed.

To test the full flow locally:
1. Run `npm run dev`
2. Clear cookies/localStorage for `localhost:3000`
3. Use test phone `5555550101` to create a session
4. Clear cookies again, use `5555550102` to join via the share code

# UAT

A project-specific UAT skill lives at `~/.claude/skills/ratemypupusa-uat.md`. Invoke it as `/ratemypupusa-uat` from any Claude Code session in this project.

The skill runs the full create/join/rate/leaderboard lifecycle and enforces a mandatory **Start New Crawl smoke test (SF-01)** on every run — that flow breaking was the highest-impact regression this app has had. The skill also knows about the lightningcss worktree gotcha, the Preview MCP network-isolation limitation, and the correct 4-factor rating schema (taste · value · curtido · other).

**Rating factors (exactly 4):** `taste` · `value` · `curtido` · `other`
Defined in `lib/constants.ts`. Never reference the old 6-factor schema.

**Auth loading guard:** `app/page.tsx` shows a loading spinner while `authLoading=true`. If the create/join form or phone input appears immediately on clicking "Start New Crawl" (before auth resolves), that is a critical regression — the spinner must appear first.

**Dev server config:** `.claude/launch.json` configures the Preview MCP to run `npm run dev` on port 3000. Use `preview_start: name "dev"` to start it.

**Worktree note:** If the dev server 500s with `Cannot find module '../lightningcss.darwin-arm64.node'`, run `npm install lightningcss --no-save` and clear `.next/` before restarting.
