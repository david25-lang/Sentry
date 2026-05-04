# Sentry Frontend

Sentry is a Next.js frontend for road-damage analysis with:

- YOLO detection (bounding boxes)
- CNN classification (single-label prediction)
- Side-by-side model comparison
- Local settings and history management

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand state management

## Prerequisites

- Node.js 20+
- A running backend API (default: `https://sentry-backend-cucr.onrender.com`)

## Environment

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_API_URL=https://sentry-backend-cucr.onrender.com
```

If `NEXT_PUBLIC_API_URL` is not set, the app falls back to `https://sentry-backend-cucr.onrender.com`.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality Checks

```bash
npm run lint
npm run build
```

## Expected Backend Endpoints

- `GET /health`
- `GET /api/v1/models`
- `GET /api/v1/classes`
- `POST /api/v1/detect/url`
- `POST /api/v1/detect/upload`
- `POST /api/v1/classify/url`
- `POST /api/v1/classify/upload`
- `POST /api/v1/compare/url` (optional, app includes fallback)
- `POST /api/v1/compare/upload` (optional, app includes fallback)

## Notes

- Detection and classification image previews currently use native `<img>` tags in several places. This is safe, but lint warns that `next/image` can improve optimization.
- Build should pass with the current setup.
