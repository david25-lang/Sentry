Deployment steps for Vercel

1) Connect repository
- Go to https://vercel.com and import the GitHub repo `david25-lang/Sentry` (or connect your repository).

2) Framework & build
- Vercel will detect Next.js automatically. Build command: `npm run build`. Output directory: (none; Next handles `.next`).

3) Environment variables
- Add `NEXT_PUBLIC_API_URL=https://sentry-backend-cucr.onrender.com` in the Vercel project settings under "Environment Variables".

4) Recommended local checks
- Run locally to verify the build:

```bash
npm install
npm run build
npm run start
```

5) Optional: pin Node engine
- To ensure matching Node runtime on Vercel, optionally add an `engines` field in `package.json`, for example:

```json
"engines": {
  "node": "18.x || 20.x"
}
```

6) Trigger deploy
- After pushing changes to the default branch, Vercel will start a deployment automatically. Monitor the deployment logs on Vercel and fix any reported TypeScript/build errors.

Files changed in this repo to help deployment:
- `vercel.json` — minimal Vercel config
- `components/ui/resizable.tsx` — type fixes to prevent build-time errors
- `lib/api.ts` — default backend URL now points to the Render deployment
- `components/settings.tsx` — UI now shows the shared backend URL

If you want, I can:
- run a local `npm run build` now to verify (will run in your workspace), or
- add the `engines` field to `package.json` and push the change.
