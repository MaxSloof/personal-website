# personal-website

Static personal site, hosted on Cloudflare Pages. `public/` is served as the site root.

| Path | Source |
|---|---|
| `/` | `public/index.html` |
| `/toledo/` | Proxied by `functions/toledo/[[path]].js` from a separate Pages project that deploys `toledo/docs/site` |

```sh
npm run build                 # bundle src/gpu.js (three.js) into public/gpu.js; commit the result
npx wrangler pages dev --binding TOLEDO_ORIGIN=https://<toledo-project>.pages.dev
npx wrangler pages deploy
```

Cloudflare Pages git integration: build command empty, output directory `public`.

Set `TOLEDO_ORIGIN` under `[vars]` in `wrangler.toml` (Pages ignores dashboard variables when that file exists) to the Toledo project's origin; `/toledo/` returns 500 without it. That project deploys `toledo/docs/site` (no build command), and the function passes requests through to it.
