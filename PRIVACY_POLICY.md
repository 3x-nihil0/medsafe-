# MedSafe — Privacy Policy

**Effective date:** 2 October 2026

This policy describes how MedSafe handles your information. The short version:

> **MedSafe has no server. Nothing you enter is uploaded, sold, or shared. Your health data
> stays on the device you use the app on.**

---

## 1. What the app stores

MedSafe saves data locally on your device (in the browser's storage for the web/PWA version,
and in the app's own storage for the Android/iOS version):

- Profile details: name, date of birth, sex, blood group, phone number, photo
- Health conditions you select
- Documented drug allergies and reactions
- Medications, doses, schedules and inventory counts
- Dose history, refill notifications and safety alerts
- Appearance preferences and the optional PIN (stored only as a salted hash — never the PIN)
- Any photos you attach to a medication

## 2. What the app sends anywhere

**None.** MedSafe makes no network requests with your data:

- No accounts, no sign-up, no server
- No analytics, no advertising SDKs, no trackers, no third-party scripts
- No cloud sync, no crash reporting
- Safety screening runs entirely in the app on your device

The app works with no internet connection once installed.

## 3. Notifications

Dose notifications are produced locally by the app. They are not sent by a remote messaging
service and are never read by us — because there is no "us" in the data path: the software has
no backend.

## 4. Backups

Your data leaves the device only if **you** export it: *About → Back up / restore* creates a
JSON file that you control. That file contains your health information in plain text — share it
carefully. Restoring a backup replaces the data on that device.

## 5. The PIN lock

The optional PIN is an app lock, not encryption. It is stored as a salted PBKDF2 hash and cannot
be read back, but the health records themselves are stored unencrypted on the device. Anyone who
removes the lock or has full access to an unlocked device can read them — the same as with most
apps that do not use full-disk encryption.

## 6. Children

MedSafe is not directed at children. Profiles for dependants should be managed by a parent or
guardian.

## 7. Deleting your data

- In the app: *Profile → Erase all data* removes every record and the PIN from the device.
- PWA: clearing the site's browser data or removing the installed app also deletes it.
- Android: uninstalling the app deletes its local storage.

Because there is no server, deletion on your device is complete — no copies exist elsewhere.

## 8. Your rights

You may access, correct, export or delete your data at any time using the controls above. This
approach is designed to satisfy the principles of the Nigeria Data Protection Regulation (NDPR),
the GDPR and similar regimes: data minimisation, purpose limitation, and no transfer without
consent.

## 9. Changes to this policy

If the app ever gains optional cloud features, this policy will be updated before those features
ship, and the new terms will be described in the app.

## 10. Contact

Questions about privacy: **Glory Ephraim**, Faculty of Computing & Informatics, Miva Open
University, Abuja, Nigeria. Contact details are published alongside the app listing.
