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
