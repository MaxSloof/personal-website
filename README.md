# personal-website

Personal site on Cloudflare Workers static assets. `public/` is served as the site root.

| Path | Source |
|---|---|
| `/` | `public/index.html` |
| `/toledo/` | `src/toledo-proxy.js` forwards to the `toledo-landing` Worker (`toledo/docs/site`) through a service binding |

```sh
npm run build                 # bundle src/gpu.js (three.js) into public/gpu.js; commit the result
npx wrangler dev -c wrangler.toml -c ../toledo/wrangler.toml   # local preview with /toledo/
npx wrangler deploy           # manual deploy
```

Workers Builds settings: build command empty, deploy command `npx wrangler deploy`, root directory empty. Deploy `toledo-landing` first: the service binding fails if that Worker doesn't exist yet.
