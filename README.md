# Sliik Mobile

Expo (Expo Router) client for **Sliik**, a beauty and grooming appointment booking marketplace. Customers discover, book, and pay local service providers; providers manage their services, availability, portfolio, and earnings.

Talks to the [`sliik-backend`](../sliik-backend) NestJS API — no business logic lives in this repo.

## Tech Stack

- **Framework**: Expo SDK 57 + Expo Router (file-based routing, typed routes)
- **Language**: TypeScript (strict), React 19 / React Native 0.86
- **Data**: TanStack Query (server state) + Zustand (client state)
- **Forms**: react-hook-form + zod
- **Styling**: NativeWind (Tailwind)
- **Realtime**: socket.io-client
- **HTTP**: axios

## Project Structure

```
src/
├── app/                  # Expo Router routes only (thin, no UI logic)
├── screens/              # real screen UI — routes render these
├── components/           # globally reusable UI
├── hooks/
│   ├── common/           # cross-cutting hooks (use-chat-socket, use-notifications-socket, ...)
│   └── services/         # TanStack Query hooks, grouped by domain
├── services/             # raw axios calls per domain (no React)
├── store/                # Zustand global non-server state
├── interfaces/           # shared TS types
├── lib/                  # third-party singletons (socket, query-client), constants, utils
└── validations/          # Zod schemas per domain
```

Path aliases: `@/*` → `./src/*`, `@/assets/*` → `./assets/*`.

## Getting Started

Prerequisites: Node.js, npm, Expo Go (or a dev build), and the `sliik-backend` API running/reachable.

```bash
npm install
cp .env.example .env    # fill in the values described below
npm run start            # start the Expo dev server
```

Then run `npm run ios`, `npm run android`, or `npm run web` for a specific target.

## Environment Variables

Only `EXPO_PUBLIC_*` variables reach the client bundle — never put real secrets in `.env`.

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_URL` | Base URL of the `sliik-backend` API |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google web client ID for Google Sign-In |

## Scripts

| Script | Description |
|---|---|
| `npm run start` | Start the Expo dev server |
| `npm run android` | Start with Android target |
| `npm run ios` | Start with iOS target (macOS only) |
| `npm run web` | Start with web target |
| `npm run lint` | Lint (`expo lint`) |

## License

Private, unlicensed portfolio project.
