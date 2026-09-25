# The Coco Shack — website

Marketing site for The Coco Shack, a live coconut bar for weddings, corporate events and festivals across Toronto and the GTA — coconuts opened live, with mocktails and cocktails served right in the shell.
Static Astro + Tailwind build, deployed to GitHub Pages. No CMS — everything editable lives in two files.

## Before launch: fill these in

All in `src/config/site.ts`. Anything left blank simply hides itself.

| Setting | What it does |
| :-- | :-- |
| `booking.web3formsKey` | Booking requests are emailed to you. Get a free key at [web3forms.com](https://web3forms.com) (enter the inbox that should receive bookings). Until it's set, the form hands visitors off to email or an Instagram DM so no lead is lost. |
| `contact.email` | Shown in the footer/contact section and used as the backup delivery route. |
| `contact.phone` | Adds call/text buttons (including the sticky mobile bar). Any format, e.g. `(416) 555-0123`. |
| `booking.calendlyUrl` | Optional. Adds "Book a quick call" buttons that open your Calendly in a popup. |
| `booking.responseTime` | Optional, e.g. `one business day`. Shows "we usually reply within …" — only promise what you'll keep. |
| `pricing.startingFrom` | Optional, e.g. `$3,000`. Shows "Most events start from …" to screen out budgets that don't fit. |
| `url` | Your live domain. Keep in sync with `site` in `astro.config.mjs`, `public/CNAME` and the sitemap line in `public/robots.txt`. |

Then review the copy in `src/data/content.ts` — the three services (Coconut Bar, Mocktails, Cocktails), event types, FAQs and booking-form options — and the privacy notice in `src/pages/privacy.astro`.

**Testimonials:** add real client quotes to `testimonials` in `src/data/content.ts` — the section appears automatically once there's at least one.

## The booking form

Two steps: the event first (type, date, venue or city, guest count, the exact number of coconuts, and which stations — Coconut Bar, Mocktails, Cocktails, or "not sure yet"), then contact details. Requests are delivered to the inbox through Web3Forms (`booking.web3formsKey`); without a key, the form hands the finished request to the visitor to send by email or Instagram DM instead. Options live in `bookingOptions` in `src/data/content.ts`; the form itself is `src/components/booking/BookingForm.astro` + `src/scripts/booking-form.ts`.

## Run it locally

Requires Node 22.12+.

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # production build into ./dist
npm run check      # type/template checks
```

## Deploy

**GitHub Pages — live now.** `.github/workflows/deploy.yml` builds and publishes the site on every push to `main` (or on demand from the Actions tab). `public/CNAME` points it at thecocoshack.ca, so the workflow runs a plain `npm run build` for the domain root. To build for the bare `aathii.github.io/coco-shack-website/` subpath instead, set `GITHUB_PAGES=true` — `astro.config.mjs` switches `site` and `base` to match. Note: `public/CNAME` is still copied into `dist/` in that build — remove it before publishing to the subpath.

**Cloudflare Pages — if it ever moves there.** Workers & Pages → Create → Pages → connect the repo · framework preset **Astro** · build command `npm run build` · output directory `dist` · add the domain under **Custom domains**. `public/_headers` (long-lived caching for hashed assets, basic security headers) is a Cloudflare Pages file — GitHub Pages ignores it.

## Swapping photos, video or the brand mark

- **Hero:** `src/assets/hero/` holds the clip of Andrew cutting a coconut — `coconut-cut-desktop.*` for landscape viewports, `coconut-cut-mobile.*` for portrait, each as `.webm` + `.mp4` with a `-poster.jpg`. `src/assets/owner/andrew-hero.jpg` is the opening beat before the video takes over (and the resting background when the video can't play). Wired up in `src/components/sections/Hero.astro`.
- **Owner carousel:** the photos in `src/assets/owner/`; captions and alt text live in `src/components/sections/OwnerCarousel.astro`.
- **Detail shots:** `src/assets/booth.jpg` feeds the `PhotoCrop` crops in `src/components/sections/Setup.astro` and `About.astro` (crops are set by focal point there). A 2400px+ wide replacement looks best on large screens.
- After changing `booth.jpg` or the coconut mark, regenerate favicons, app icons and the social-share image: `npm run brand-assets`.

## Where things live

```text
src/config/site.ts          business details + integrations
src/data/content.ts         services, events, FAQs, testimonials, form options
src/components/sections/    one file per page section (Hero, Services, Booking…)
src/components/booking/     the two-step booking form
src/scripts/                all interactivity (smooth scroll, reveals, header, form…)
src/styles/global.css       colours, fonts, buttons, form controls, animations
src/assets/                 hero video + posters, owner photos, booth photo
public/                     favicons, social image, CNAME, robots.txt, _headers
.github/workflows/          GitHub Pages deploy
```
