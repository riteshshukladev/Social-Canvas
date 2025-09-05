# Social Canvas

A mobile-first collaborative canvas app built with Expo, Expo Router, Clerk (auth), Supabase (DB + Storage), and tldraw (canvas) running inside a WebView. It supports light/dark mode, secure auth, and automatic syncing of drawings to Supabase.

- App entry: [app/_layout.tsx](app/_layout.tsx)
- Home screen: [app/(screen)/profile.tsx](app/(screen)/profile.tsx) → [app/(screen)/catalog/HomePage.tsx](app/(screen)/catalog/HomePage.tsx)
- Canvas screen: [app/catalog/[id].tsx](app/catalog/%5Bid%5D.tsx)
- Canvas WebView: [components/TldrawWebView.tsx](components/TldrawWebView.tsx)
- Supabase client: [lib/supabase.ts](lib/supabase.ts)
- Auth + Supabase wiring: [components/SupabaseProvider.tsx](components/SupabaseProvider.tsx), [hooks/useSupabase.tsx](hooks/useSupabase.tsx)
- Catalog services: [services/catalogServices.ts](services/catalogServices.ts)
- Canvas storage helpers: [lib/canvasStore.ts](lib/canvasStore.ts), [lib/assetUpload.ts](lib/assetUpload.ts)
- Donut loader: [components/Loader/SequentialDonutLoader.tsx](components/Loader/SequentialDonutLoader.tsx)

## Features

- Secure authentication with Clerk (email/password + OAuth)
- Supabase-backed data model (users, catalogs, canvases) with RLS-ready patterns
- Drawing canvas powered by tldraw inside a React Native WebView
- Auto-save and manual save of canvas snapshots to Supabase
- Image assets in drawings auto-uploaded to Supabase Storage
- Expo Router file-based navigation
- NativeWind + custom fonts
- Light/Dark mode support (dynamic styling)
- Production-ready EAS build configuration

## Tech Stack

- React Native + Expo ([app.json](app.json), [package.json](package.json))
- Expo Router ([app/_layout.tsx](app/_layout.tsx))
- Clerk auth (@clerk/clerk-expo)
- Supabase (@supabase/supabase-js)
- WebView (react-native-webview) for tldraw
- NativeWind/Tailwind
- Hermes JS engine

## Prerequisites

- Node 18+ and npm or yarn
- An Expo account (optional for EAS)
- Clerk project with a Publishable Key
- Supabase project with:
  - REST and Realtime enabled
  - Storage bucket: tldraw-assets (public, or with signed URLs)
  - Tables: users, catalog, canvases
  - RLS policies configured (see below)

## Environment Variables

Create a `.env` file (not committed) with:

- EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY

These are read by:
- Clerk provider in [app/_layout.tsx](app/_layout.tsx)
- Supabase client in [lib/supabase.ts](lib/supabase.ts)

## Install & Run

1) Install dependencies
```sh
npm install
```

2) Start development (Expo Go or dev client)
```sh
npx expo start
```

3) Android/iOS development build (optional, recommended for WebView-heavy flows)
```sh
npx expo run:android
# or
npx expo run:ios
```

Notes:
- Expo Go is fine for most flows. Live theme switching may not always update in Expo Go; it works reliably in custom builds.

## Authentication Flow

- Auth UI: [app/(auth)/login.tsx](app/(auth)/login.tsx), [app/(auth)/signup.tsx](app/(auth)/signup.tsx)
- Token caching: [`tokenCache`](utils/tokenCache.ts)
- App is wrapped with `<ClerkProvider />` in [app/_layout.tsx](app/_layout.tsx)
- After sign-in, app routes to [app/(screen)/profile.tsx](app/(screen)/profile.tsx)

## Supabase Integration

- Client: [lib/supabase.ts](lib/supabase.ts)
  - Hermes crypto polyfill is imported here: `react-native-get-random-values`
  - URL polyfill: `react-native-url-polyfill/auto`
- Context: [components/SupabaseProvider.tsx](components/SupabaseProvider.tsx)
- Runtime token refresh & header setup: [hooks/useSupabase.tsx](hooks/useSupabase.tsx)
  - Refreshes Clerk JWT every 45s
  - Updates `supabase.realtime.setAuth(token)` and `supabase.rest.headers.Authorization`

## Data Model (Recommended)

Tables:
- users (id text PK = Clerk user id, email, first_name, last_name, avatar_url, updated_at)
- catalog (id uuid PK, user_id text, name text, creation_date int, created_at timestamptz)
- canvases (id uuid PK, user_id text, canvas_name text, data jsonb, version int, updated_at timestamptz)

Important:
- Use Clerk user id (e.g., "user_abc123") as text in `user_id` columns.
  - If you use uuid instead, you’ll get errors like: invalid input syntax for type uuid.

Example service usage:
- CRUD in [services/catalogServices.ts](services/catalogServices.ts)
- Canvas save/load in [lib/canvasStore.ts](lib/canvasStore.ts)

## RLS Policy Hints

If JWT contains Clerk `sub` (the user id string), write policies like:
```sql
-- Can read own catalogs
create policy "read own catalogs"
on public.catalog for select
using (user_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub'));

-- Can manage own canvases
create policy "write own canvases"
on public.canvases for all
using (user_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub'))
with check (user_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub'));
```

## Canvas (tldraw) via WebView

- Component: [components/TldrawWebView.tsx](components/TldrawWebView.tsx)
- Route screen: [app/catalog/[id].tsx](app/catalog/%5Bid%5D.tsx)
- Auto-save: sends messages from WebView to RN, and then to Supabase via [lib/canvasStore.ts](lib/canvasStore.ts)
- Asset rewriting: [lib/assetUpload.ts](lib/assetUpload.ts) uploads base64 image assets to `tldraw-assets` and rewrites URLs in the snapshot

CDN imports inside the WebView:
- Keep React and ReactDOM versions matched with tldraw:
  - Current import map pins React 19 + ReactDOM 19 with tldraw 2.4.0
- If you see “hooks” or `useRef` errors in WebView, it usually means version or duplicate React mismatch. Pin exact versions.

Production tip:
- For maximum reliability, ship a small pre-bundled static HTML for tldraw rather than CDN import maps.

## Theming

- Uses `useColorScheme()` for light/dark mode (e.g., dynamic borders in [app/(screen)/catalog/HomePage.tsx](app/(screen)/catalog/HomePage.tsx), and modals)
- Expo Go sometimes does not live-update theme changes; custom dev/production builds do.

## UI Utilities

- Donut loader: [components/Loader/SequentialDonutLoader.tsx](components/Loader/SequentialDonutLoader.tsx)
  - Props: `size`, `ball`, `color`, `base`, `overlay`, `text`
  - Auto tints text based on theme
- Empty state & modals:
  - [components/EmptyCatalogs.tsx](components/EmptyCatalogs.tsx)
  - [components/CreateCatalogOverlay.tsx](components/CreateCatalogOverlay.tsx)
  - [components/DeleteCatalogModal.tsx](components/DeleteCatalogModal.tsx)
  - [components/LogoutModal.tsx](components/LogoutModal.tsx)

## Project Structure

See the `app/` router directories:
- `(auth)` → login/signup flow
- `(screen)` → main app screens
- `catalog/` → catalog-specific routes, including `[id].tsx` for canvas

Also:
- Services: [services/catalogServices.ts](services/catalogServices.ts)
- Hooks: [hooks/useSupabase.tsx](hooks/useSupabase.tsx), [hooks/useWarmUpBrowser.ts](hooks/useWarmUpBrowser.ts), [hooks/useUserSync.ts](hooks/useUserSync.ts)
- Styles: [styles/authstyles.ts](styles/authstyles.ts), [styles/global.css](styles/global.css)
- Metro config (SVG, NativeWind): [metro.config.js](metro.config.js), [tailwind.config.js](tailwind.config.js)

## Scripts

From [package.json](package.json):
- `npm run start` — start Metro/Expo dev
- `npm run android` / `npm run ios` — run on device/simulator (dev build)
- `npm run web` — run web (static bundler: metro)
- `npm run lint` — lint

## Known Caveats & Troubleshooting

- Hermes “Property 'crypto' doesn't exist”
  - Cause: Hermes lacks Web Crypto by default
  - Fix: ensure `react-native-get-random-values` is installed and imported early (already done in [lib/supabase.ts](lib/supabase.ts) and [app/_layout.tsx](app/_layout.tsx))
- Expo Go theme not updating live
  - Known limitation; theme changes are reliable in dev/prod builds
- `useLocalSearchParams` / `useRouter` ReferenceError
  - Add/import from `expo-router` at usage site (see [app/catalog/[id].tsx](app/catalog/%5Bid%5D.tsx))
- “Invalid prop style supplied to React.Fragment”
  - Do not attach `style` to fragments; wrap with `View` instead
- Postgres `22P02 invalid input syntax for type uuid`
  - Ensure `user_id` columns are `text` when storing Clerk user ids (e.g., “user_abc123”)

## Building

- EAS config: [eas.json](eas.json)
- App metadata: [app.json](app.json)
- Run a dev client:
  ```sh
  npx expo run:android
  # or
  npx expo run:ios
  ```
- Production Android APK (example in eas.json):
  ```sh
  npx expo run:android --variant release
  # or EAS Cloud:
  npx expo build:android
  ```

## Contributing

1. Fork and clone
2. Create a feature branch
3. Commit with clear messages
4. Open a PR with context (screenshots encouraged)

Before PR:
- Run locally on device/emulator
- Ensure auth and canvas save work end-to-end
- Keep React/ReactDOM/tldraw versions in WebView aligned

## License

MIT — feel free to use this project as a starter for your own canvas-
