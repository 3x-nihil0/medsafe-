# MedSafe — Medication Safety Companion

An offline-first mobile web app (PWA) that screens every medication you add against your
documented allergies, your current prescriptions and your health conditions — then reminds
you when doses are due and warns you before you run out.

**Everything runs on your device.** No server, no database, no account, no running costs.

---

## What it does

| Area | Behaviour |
| --- | --- |
| Safety screening | Drug–drug interactions, allergy / cross-reactivity, duplicate therapy and condition-based contraindications — checked *before* a medication is saved. |
| Fail-safe rule base | A drug that is not in the verified rule base is reported as **unverified — pharmacist review required**, never as "safe". |
| Dose schedule | Every dose slot re-arms daily. One tap records a dose and decrements the pill count. |
| Refill forecasting | Days of supply computed from dose frequency; warns before depletion. |
| Profiles | Multiple people on one device, each with their own medications, allergies and history. |
| Backup | Export / restore everything as a JSON file — move to a new phone or keep a copy. |
| Offline | Full app shell cached by a service worker; works with no connection after first load. |

The rule base is compiled from WHO ATC classification, British National Formulary guidance
and FDA drug safety communications.

> MedSafe is a decision-support aid, not a doctor. It does not diagnose or prescribe.

---

## Develop locally

```bash
npm install
npm run dev      # http://localhost:5173
```

Other commands:

```bash
npm run lint     # TypeScript strict typecheck
npm test         # Rule-engine regression suite (TC1–TC8)
npm run build    # typecheck + tests + production bundle in dist/
npm run preview  # serve the production bundle locally
npm run icons    # regenerate every icon/splash from public/icon.svg
```

Requires Node.js 20 or newer. No environment variables are needed.

---

## Put it on your phone (free)

The build is a static site, so any free static host works. All of these have a free tier,
serve HTTPS (required for PWA install) and take about two minutes:

- **[Cloudflare Pages](https://pages.cloudflare.com)** — recommended
- **[Netlify](https://www.netlify.com)** — drag-and-drop deploy
- **[GitHub Pages](https://pages.github.com)** — via the GitHub Action below

### 1. Build

```bash
npm run build
```

This produces the `dist/` folder.

### 2. Deploy `dist/`

**Netlify (fastest):** go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the
`dist` folder onto the page. You get an `https://….netlify.app` URL immediately.

**Cloudflare Pages:** Dashboard → Workers & Pages → Create → Pages → Upload assets → drop the
`dist` folder.

**GitHub Pages (fully automatic):** the deploy workflow is already committed at
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Push the repo to GitHub, set
**Settings → Pages → Source: GitHub Actions**, and every push to `main` rebuilds and publishes.

`netlify.toml` is included too, so `npx netlify deploy --prod` works with no configuration —
it already sets the cache headers the service worker needs.

### 3. Install it

**Android (Chrome)**
1. Open your app's `https://` URL in Chrome.
2. Tap **Install** in the address bar (or menu → *Add to Home screen*).
3. Confirm — MedSafe appears in your app drawer and opens without browser chrome.

**iPhone / iPad (Safari)**
1. Open the URL in Safari.
2. Tap the **Share** button → **Add to Home Screen**.
3. Name it *MedSafe* → **Add**.

**Desktop:** Chrome/Edge show an install icon in the address bar.

After installing, open **About → Dose notifications → Enable notifications** so MedSafe can
alert you when a dose is due, and log your first profile from the setup screen.

### iPhone / iPad — the PWA *is* the app

Apple does not allow installing `.apk` files, and a native iOS binary can only be produced on a
Mac with Xcode. The **installed PWA is the supported iPhone build** and it is a first-class one:
Safari renders it full-screen (no browser chrome), it gets its own icon and launch screen, it
works offline, and `apple-touch-icon` is generated at the correct 180 px size by `npm run icons`.

1. Open your `https://` URL in **Safari** (the tab must be Safari, not Chrome).
2. Share sheet → **Add to Home Screen** → **Add**.
3. Grant notifications when prompted (iOS 16.4+).

Native iOS route (only if you later want App Store distribution): `npx cap add ios` **has already
been run** — the [`ios/`](ios/) project and all icon/splash assets exist — so on a Mac it is
`npx cap open ios` + Xcode. That path needs Apple's Developer Program at **$99/year**; the PWA
needs nothing.

---

## Build a real Android APK (optional, free)

The native Android project is **already scaffolded** in [`android/`](android/), so producing an
`.apk` is a one-command sync plus a Gradle build. Nothing here costs money — you only need
[Android Studio](https://developer.android.com/studio) installed (it bundles the JDK and SDK it
needs).

```bash
# 1. typecheck + tests + production build, then copy into the Android project
npm run android:sync

# 2a. easiest: open it in Android Studio and press Run ▶ (needs a phone or emulator)
npm run android:open

# 2b. or build the file directly from a terminal
cd android && ./gradlew assembleDebug       # macOS / Linux
cd android && .\gradlew.bat assembleDebug   # Windows
```

The installable file lands at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Copy it to your phone and open it to install (Android will ask you to allow installs from
unknown sources).

**Release build for Google Play:** Android Studio → *Build → Generate Signed Bundle/APK*.
Google Play requires an **AAB** (`./gradlew bundleRelease`) and a one-time $25 developer
account; keep the signing keystore safe — losing it means you cannot update the app.

**Behaviour differences in the APK:** the service worker is switched off (so an app update can
never show stale files), the “Install on Phone” button hides itself, and everything else —
storage, reminders, offline operation — is identical to the PWA.

---

## Data & privacy

- Data lives in your browser's storage **on that device only** — nothing is uploaded.
- Clearing browser data or uninstalling the app deletes it, so use **About → Back up /
  restore** regularly.
- Notifications fire while the app is open or in the foreground. Do not rely on MedSafe as
  your only reminder for time-critical medication.

---

## Project layout

```
src/
  App.tsx                 shell, persistence wiring, daily scheduler, app lock
  components/             screens (Today, Cabinet, Refills, Safety, Settings) + modals
  components/AppLockScreen.tsx  4-digit PIN lock (setup / unlock / recovery)
  services/ruleEngine.ts  screening algorithms (allergy, interaction, duplicate, contraindication)
  services/clinicalOntology.ts  drug registry, allergy classes, interaction rule base
  services/store.ts       local-first persistence layer
  lib/appLock.ts          PIN hashing (PBKDF2) — never stores the PIN
  data/initialData.ts     rule base + optional example profiles
scripts/runFormalTests.ts regression suite (TC1–TC8)
scripts/generateIcons.mjs all icons and splash screens, generated from one SVG
public/sw.js              offline service worker (browser/PWA only)
capacitor.config.ts       native shell config (appId: com.gloryephraim.medsafe)
android/ + ios/           generated Capacitor projects with icon sets — commit these
.github/workflows/        ci.yml (tests) + deploy.yml (GitHub Pages publish)
```

## Documents

- [`PRIVACY_POLICY.md`](PRIVACY_POLICY.md) — required by Google Play and Apple; host it at an
  HTTPS URL and paste that URL into the store console.
- [`STORE_LISTING.md`](STORE_LISTING.md) — ready-to-paste Play Store copy, data-safety answers,
  screenshot shot list and the signed-release checklist.

### Adding cloud sync later

All reads and writes go through `src/services/store.ts` and React state in `App.tsx`.
A sync backend can be added by introducing a repository interface in `store.ts`
(read-through / write-through) without touching the screens.
