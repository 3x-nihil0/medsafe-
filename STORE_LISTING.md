# MedSafe - Google Play listing (draft)

Everything below is ready to paste into the [Play Console](https://play.google.com/console)
store listing form. Character limits are marked; every string already fits.

---

## 1. Store identity

| Field | Value | Limit |
| --- | --- | --- |
| App name | `MedSafe: Medication Safety` | 30 chars ✓ (27) |
| Short description | `Screen drug interactions, get dose reminders and track refills - offline.` | 80 chars ✓ (74) |
| Full description | see §2 | 4,000 chars ✓ |
| App type | Application | - |
| Category | **Health & Fitness** (secondary: Medical) | - |
| Tags | medication, drug interaction, allergy, reminders, offline | - |
| Contact email | *your support email* | required |
| Privacy policy URL | *URL where `PRIVACY_POLICY.md` is hosted* | **required for health apps** |

## 2. Full description

```
MedSafe keeps you safe from the two mistakes that happen most often with daily
medication: taking something that interacts with another drug you take, and
forgetting a dose.

ADD A MEDICATION, GET A SAFETY CHECK FIRST
Every medication is screened against your allergies, your current prescriptions
and your health conditions before it is saved. You see drug-drug interactions,
allergy and cross-reactivity warnings, duplicate therapy and
condition-based contraindications - each with the clinical effect and the
source reference (WHO ATC, British National Formulary, FDA safety
communications).

NEVER ASSUME "SAFE"
If a drug is not in the verified rule base, MedSafe says so: "unverified -
pharmacist review required". It does not quietly clear what it does not know.

DOSE REMINDERS THAT RE-ARM DAILY
Each dose slot repeats every day. One tap records a dose and decrements your
pill count so you always know what is left.

RUN OUT BEFORE YOU RUN OUT
Refill forecasting works out how many days of supply remain from your dose
frequency and warns you before the pack runs dry.

ALLERGIES ON RECORD
Document allergies once - every future medication is screened against them.

SEVERAL PEOPLE, ONE PHONE
Create a separate profile for each family member. Everything stays apart.

WORKS OFFLINE, NO ACCOUNT
MedSafe runs without an internet connection and without sign-up. Your health
data never leaves your device: there is no server, no analytics and no
tracking.

PROTECTED
Optional 4-digit PIN lock, light and dark themes, and JSON backup/restore so
you can move to a new phone.

IMPORTANT
MedSafe is a decision-support aid, not a doctor. It does not diagnose,
prescribe or replace professional medical advice. If you feel unwell or have a
serious reaction after taking a medication, seek emergency care immediately.
```

## 3. Google Play "Data safety" form

| Question | Answer |
| --- | --- |
| Does your app collect or share any user data? | **No** |
| Is data collected on device? | Yes - health info, app activity, device identifiers (PIN hash) |
| Is data transmitted off the device? | **No** |
| Is data sold? | **No** |
| Can users request deletion? | Yes - in-app "Erase all data" removes everything locally |

Answering "collects nothing, transmits nothing" still requires the Data safety section to be
filled in as above, because Play counts on-device storage of health info as "collected".

## 4. Content rating

Complete the Play Console questionnaire. Expected outcome: **Everyone / Everyone 10+** - no
violence, no gambling, no medical *procedures*, and the app gives no diagnosis. Declare honestly
that the app provides health information; answer "no" to "does the app provide medical advice
that replaces a professional" (it explicitly disclaims this).

## 5. Assets checklist

| Asset | Size | Status |
| --- | --- | --- |
| App icon (foreground) | 512 × 512 PNG, no transparency | ✅ `assets/icon.png` (1024, downscale on upload) |
| Feature graphic | 1024 × 500 | ❌ needs design (teal gradient + icon + wordmark) |
| Phone screenshots | min 2, max 8, 1080 × 1920 (or 16:9) | ❌ capture from a device/emulator |
| Privacy policy | public HTTPS URL | ✅ `PRIVACY_POLICY.md` (host it, see below) |
| Signed release bundle (AAB) | - | ✅ build with `cd android && ./gradlew bundleRelease` |

### Screenshot shot list (in order)
1. **Today** - daily adherence + next dose (after adding 2-3 medications)
2. **Safety alert** - the red "ALLERGY ALERT: SEVERE" screen when adding Amoxicillin with a
   penicillin allergy
3. **Cabinet** - medication cards with supply counts
4. **Refills** - forecast card showing days remaining
5. **Safety → Drug guide** - searchable reference
6. **Profile** - PIN lock controls and dark mode (or the lock screen itself)
7. **About** - "works offline / data stays on device" card

Take them in light mode *and* include at least one dark-mode shot.

## 6. Release checklist

- [ ] `npm run build` green (typecheck + 8/8 tests + bundle)
- [ ] `npm run android:sync`
- [ ] Generate a **keystore** and keep it backed up: Android Studio → *Build → Generate Signed
      Bundle/APK → Android App Bundle* (a lost keystore = no more updates)
- [ ] `./gradlew bundleRelease` → `android/app/build/outputs/bundle/release/app-release.aab`
- [ ] Create a Play Console developer account ($25 one-time) and accept the health-app policy
- [ ] Upload to an **internal testing** track first; install from Play on a real phone
- [ ] Fill in Data safety, content rating, privacy policy URL, contact email
- [ ] Submit for review (health apps usually take longer - allow a few days)

## 7. Also host the privacy policy

Play requires a reachable HTTPS URL. Easiest free route: the GitHub Pages deploy in
`.github/workflows/deploy.yml` publishes `dist/` only, so publish the policy as a separate page:

1. Rename `PRIVACY_POLICY.md` → `public/privacy.html` (Markdown → HTML) **or**
2. Create a separate one-page repo/gist rendered by GitHub Pages, **or**
3. Paste it into any free docs host (Notion, GitLab Pages, Netlify Drop with a single HTML file).

The URL you get (e.g. `https://your-name.github.io/medsafe/privacy.html`) goes into the Play
Console privacy policy field and into the app's About screen.
