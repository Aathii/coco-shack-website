# The Coco Shack — website

Marketing site for The Coco Shack, a live coconut bar for weddings, corporate events and festivals across Toronto and the GTA.
Static Astro + Tailwind build, deploys to Cloudflare Pages. No CMS — everything editable lives in two files.

## Before launch: fill these in

All in `src/config/site.ts`. Anything left blank simply hides itself.

| Setting | What it does |
| :-- | :-- |
| `contact.email` | Shown in the contact section and footer; powers the "Email" button. |
| `contact.phone` | Powers the "Call" button, the sticky mobile bar and the mobile menu. Any format, e.g. `(416) 555-0123`. |
| `booking.calendlyUrl` | Optional. Adds "Book a quick call" buttons that open your Calendly in a popup. |
| `booking.responseTime` | Optional, e.g. `one business day`. Shows "we usually reply within …" — only promise what you'll keep. |
| `pricing.startingFrom` | Optional, e.g. `$3,000`. Shows "Most events start from …" to screen out budgets that don't fit. |
| `url` | Your live domain. Keep in sync with `site` in `astro.config.mjs` and the sitemap line in `public/robots.txt`. |

Then review the copy in `src/data/content.ts` (services, event types, FAQs) and the privacy notice in `src/pages/privacy.astro`.

**Testimonials:** add real client quotes to `testimonials` in `src/data/content.ts` — the section appears automatically once there's at least one.

## Run it locally

Requires Node 22.12+.

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # production build into ./dist
npm run check      # type/template checks
```

## Deploy (Cloudflare Pages)

1. Push this folder to a GitHub repo.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → connect the repo.
3. Framework preset **Astro** · build command `npm run build` · output directory `dist`.
4. Add your custom domain under the project's **Custom domains** tab.
5. Optional: turn on **Web Analytics** for the project (cookie-free, no code changes needed).

`public/_headers` sets long-lived caching for hashed assets and basic security headers.

## Swapping photos or the brand mark

- Hero and detail shots all come from `src/assets/booth.jpg`. Replace it with a higher-resolution photo (2400px+ wide looks best on large screens); crops are set by focal point in `src/components/sections/Setup.astro` and `About.astro`.
- After changing the photo or the coconut mark, regenerate favicons, app icons and the social-share image: `npm run brand-assets`.

## Where things live

```text
src/config/site.ts          business details + integrations
src/data/content.ts         services, events, FAQs, testimonials
src/components/sections/    one file per page section (Hero, Services, Contact…)
src/scripts/                all interactivity (smooth scroll, reveals, header, carousel…)
src/styles/global.css       colours, fonts, buttons, animations
```

## Booking form (optional add-on)

The live site has no contact form: every "Book Your Event" button goes to the **Get in touch** section, where visitors call, email or DM directly.
The full multi-step booking form (validation, draft saving, Web3Forms delivery, mailto/Instagram fallback) is kept on the **`booking-form-upcharge`** branch, exactly as it was before it was removed.

- **See or deploy the with-form version:** `git checkout booking-form-upcharge`
- **Bring the form back onto `main`** (keeps every later change to `main`): revert the removal commit —

  ```sh
  git log --oneline --grep "Remove booking form"   # find the commit
  git revert <that-commit-hash>
  ```

  Then add a free [Web3Forms](https://web3forms.com) key as `booking.web3formsKey` in `src/config/site.ts` so submissions are emailed to the owner.

  (A plain `git merge booking-form-upcharge` will **not** restore it — `main` records the form files as deliberately deleted.)
