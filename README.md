# Animated-footers

The animated "horizon" footer built for the Futurelab website, parked here so
the live site can keep its current footer.

Someone working on a laptop on a flowered hilltop above a sea of clouds at
sunset, and under the stars after dark. Day or night follows the visitor's
local time, with a toggle to flip it. It pauses when off screen and stays still
under reduced motion.

## Files

- `src/components/FooterHorizon.tsx`: the painting plus its SVG overlays
  (typing, wind in the grass, rolling clouds, sun glint, stars, shooting stars).
- `src/components/FooterBreeze.tsx`: canvas layer for petals, pollen and fireflies.
- `src/components/Footer.tsx`: the Futurelab footer (sitemap and colophon)
  wired to use `FooterHorizon`, for reference.
- `public/images/footer-horizon.webp`, `public/images/footer-horizon-night.webp`:
  the day and night paintings (same 1774x887 pixel grid).

## Dependencies

React, `framer-motion`, `lucide-react` and Tailwind CSS. `Footer.tsx` also
imports Futurelab-specific modules (`@/data/resourceLinks`,
`./core/LenisProvider`), which are not included here.

## Usage

```tsx
import { FooterHorizon } from './components/FooterHorizon';

<FooterHorizon className="aspect-[4/5] sm:aspect-[16/10] lg:aspect-[2/1]" />
```

Serve the two `.webp` files from `/images/`.
