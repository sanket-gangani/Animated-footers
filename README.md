# Animated-footers

Animated sections built for the Futurelab website, parked here so the live
site can keep its current design: the "horizon" footer and the cherry-blossom
contact form.

Someone working on a laptop on a flowered hilltop above a sea of clouds at
sunset, and under the stars after dark. Day or night follows the visitor's
local time, with a toggle to flip it. It pauses when off screen and stays still
under reduced motion.

## Files

### Horizon footer

- `src/components/FooterHorizon.tsx`: the painting plus its SVG overlays
  (typing, wind in the grass, rolling clouds, sun glint, stars, shooting stars).
- `src/components/FooterBreeze.tsx`: canvas layer for petals, pollen and fireflies.
- `src/components/Footer.tsx`: the Futurelab footer (sitemap and colophon)
  wired to use `FooterHorizon`, for reference.
- `public/images/footer-horizon.webp`, `public/images/footer-horizon-night.webp`:
  the day and night paintings (same 1774x887 pixel grid).

### Cherry-blossom contact form (`src/contact-blossom/`)

The CXO page's contact section from the Futurelab website: a blossom painting
blurred into the background with a slow Ken Burns drift, cherry petals falling
across the whole scene, and the interest form on top.

- `BlossomContactSection.tsx`: the section (painting, copy, petals, form).
- `CherryPetals.tsx`: canvas layer of falling, swaying, flipping petals that
  ease away from the pointer.
- `InterestForm.tsx`, `content.ts`, `primitives.tsx`, `cxo.css`: the form and
  the page pieces it uses.
- `public/images/cxo/blossom-temple.jpg`: the painting.

## Dependencies

React, `framer-motion`, `lucide-react` and Tailwind CSS. Some files also
import Futurelab-specific modules (`@/data/resourceLinks`,
`@/data/testimonials`, `@/lib/analytics`, `./core/LenisProvider`), which are
not included here.

## Usage

```tsx
import { FooterHorizon } from './components/FooterHorizon';

<FooterHorizon className="aspect-[4/5] sm:aspect-[16/10] lg:aspect-[2/1]" />
```

Serve the two `.webp` files from `/images/`.
