# Truth or Dare — Web

Mobile-first **Truth or Dare** party game built with **Next.js** (App Router), **React 19**, **TypeScript**, **Tailwind CSS**, **Zustand**, and **Framer Motion**. Visual design follows the Electric Social / neon glass spec (pink & cyan on deep black).

## Features

- **Party home** — Create room / Join room entry
- **Room setup** — Join with code, or create with name, player limit (2–10), and vibe chips
- **Lobby** — Room code with copy, ready states, host start (requires all ready)
- **Play** — Circular timer, player orbit, bottle spin animation, Truth / Dare actions, challenge sheet, refusal → punishment flow
- **Custom prompts** — Saved truths & dares (persisted in `localStorage` via Zustand)
- **Settings** — Display name, dare timer toggle, duration presets
- **PWA** — `manifest.json` and install-friendly metadata (add icons under `public/icons` when you ship)

## Run locally

```bash
cd truth-dare-web
npm install
npm run dev
```

**Windows + folder name with `&`:** If `npm run dev` / `npm run build` fails with a broken path (e.g. `Desktop\next\...`), it is because `cmd` treats `&` specially. This repo’s npm scripts call Next via `node ./node_modules/next/...` so builds work under paths like `Truth_&_Dare`. Alternatively, rename the parent folder to remove `&`.

Open [http://localhost:3000](http://localhost:3000).

## Firebase (optional)

Copy `.env.example` to `.env.local` and fill in your Firebase web app keys. When `NEXT_PUBLIC_FIREBASE_*` values are present, `src/lib/firebase/client.ts` initializes the app. Wire **Auth** (e.g. Google) and **Firestore** listeners for rooms, presence, and spins; the UI store in `src/store/useGameStore.ts` is structured so you can replace local updates with remote snapshots.

## React Native WebView / auth handoff

1. Authenticate in the native app (Firebase or your IdP).
2. Obtain an ID token (Firebase: `user.getIdToken()`).
3. Open the web app with the token in a query param or `postMessage` to the WebView.
4. On the web side, call `signInWithCustomToken` or exchange for a session per your security model (document the exact flow with your backend).

Keep the WebView viewport mobile-sized; this app is optimized for portrait.

## Project layout

- `src/app/(app)/` — Main UI routes with shared header + bottom tabs
- `src/store/useGameStore.ts` — Game state and persistence for custom prompts
- `src/components/game/` — Bottle, players orbit, timer
- `src/lib/firebase/` — Optional Firebase bootstrap

## Scripts

- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — ESLint
