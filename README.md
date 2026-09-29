# Happy Cats

A private shopping assistant for one Madrid household. It compares recorded prices for wet cat food, keeps favourites, and builds a mixed basket for the owner to approve.

Sushi (male, about 4 years old) and Miso (female, about 1 year old) live at postcode 28004. Together they eat about 6–8 wet portions a day, across roughly 4 flavours, plus dry food.

## Stack

This repository is a [Lovable](https://lovable.dev) project: Vite, React 19, TanStack Start, Tailwind CSS, and shadcn/ui, with dependencies locked by Bun. The earlier prototype described in the design brief (Vinext, Cloudflare Workers, D1, Drizzle, and Sites auth) is not in this repo, and this rebuild does not add a paid backend.

The catalogue is a generic category → brand → product → price model in `src/lib/catalogue.ts`. `src/db/schema.sql` is the matching SQLite schema, and `src/db/repository.ts` is the read seam a later Cloudflare D1 + Drizzle adapter can implement. The running app uses the bundled seed. Household edits stay in the browser.

## Boundaries

Sign-in is not connected. Cloudflare Sites authentication is not available in this project, and no login is simulated. Treat the app as a private household tool on one device.

These are left unwired on purpose:

- Retailer account sign-in (OAuth or sessions)
- Live loyalty balances (the ZOOCITY figure of 154 points is historical)
- Automatic price scanning
- Photo or receipt recognition
- Voice controls
- Checkout, orders, and payments

The app only recommends a basket. It never places an order or takes a payment.

Seeded prices come from two reference documents: the Naturanimal receipt of 3 Sep 2026 and the TodoMascota order of 31 Mar 2026. Other shops are listed with no price until you record one. A public page check (`checkPublicPage`) can read one https page on an allowlisted shop host. It refuses other hosts, credentials, and redirects, and it stops after 256 KB or 5 seconds. It never writes a saved unit price.

## Scripts

```sh
bun install
bun run dev
bun run lint
bunx tsc --noEmit
bun run build
bun test scripts/happy-cats.test.ts
```

The Lovable project is [dec05c7a-6feb-4dcd-8f97-bd99137b067a](https://lovable.dev/projects/dec05c7a-6feb-4dcd-8f97-bd99137b067a). Pushes to the connected branch sync back to the Lovable editor.

## Deploy to Fly.io

The production image builds the TanStack Start app with Bun and serves the Nitro Node server on port 8080 (`HOST=0.0.0.0`). `fly.toml` names the app `happy-cats`, places it in Madrid (`mad`), uses a `shared-cpu-1x` machine with 512 MB, and allows scale to zero. Fly checks `GET /`.

The app reads no secrets at runtime. `HOST`, `PORT`, and `NODE_ENV` are set in the image and in `fly.toml`.

Create the Fly app once, from a machine where `flyctl` is logged in:

```sh
fly auth login
fly apps create happy-cats
```

Deploy tokens belong in GitHub, not in the repo. Create one and store it as the `FLY_API_TOKEN` Actions secret:

```sh
fly tokens create deploy -a happy-cats
gh secret set FLY_API_TOKEN
```

Pushes to `main` run `.github/workflows/fly-deploy.yml`, which deploys with `flyctl deploy --remote-only`. A first deploy from your own machine, before that workflow has run, is:

```sh
fly deploy
```
