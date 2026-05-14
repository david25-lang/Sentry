Deployment steps for Vercel

1) Connect repository
- Go to https://vercel.com and import the GitHub repo `david25-lang/Sentry` (or connect your repository).

2) Root directory
- Set the Vercel project Root Directory to `frontend`. The Next.js app, `package.json`, and `app/` router all live there.

3) Framework & build
- Framework preset: Next.js.
- Build command: `npm run vercel-build`.
- Output directory: (none; Next handles `.next`).

4) Environment variables
- Add `NEXT_PUBLIC_API_URL=https://sentry-backend-cucr.onrender.com` in the Vercel project settings under "Environment Variables".

5) Recommended local checks
- Run locally to verify the build:

```bash
npm install
npm run vercel-build
npm run start
```

6) Optional: pin Node engine
- To ensure matching Node runtime on Vercel, optionally add an `engines` field in `package.json`, for example:

```json
"engines": {
  "node": "18.x || 20.x"
}
```

7) Trigger deploy
- After pushing changes to the default branch, Vercel will start a deployment automatically. Monitor the deployment logs on Vercel and fix any reported TypeScript/build errors.

Files changed in this repo to help deployment:
- `vercel.json` — minimal Vercel config
- `components/ui/resizable.tsx` — type fixes to prevent build-time errors
- `lib/api.ts` — default backend URL now points to the Render deployment
- `components/settings.tsx` — UI now shows the shared backend URL
