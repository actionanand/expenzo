# Expenzo — Android APK Build Guide

This project uses **Capacitor** (installed only in CI) to wrap the Angular web app into a native Android APK. No Android tooling is required locally — everything runs in a GitHub Actions workflow.

---

## Architecture

```
Angular App (src/)
    ↓  ng build
Web Assets (dist/expenzo/browser/)
    ↓  cap sync
Capacitor Android Project (generated in CI)
    ↓  gradlew assembleRelease
Unsigned APK
    ↓  zipalign + apksigner
Signed APK → GitHub Artifact / Release
```

**Key files in the repo:**

| File                                  | Purpose                                         |
| ------------------------------------- | ----------------------------------------------- |
| `capacitor.config.ts`                 | Capacitor configuration (app ID, name, web dir) |
| `.github/workflows/android-build.yml` | CI workflow that builds the APK                 |

The `android/` directory is **never committed** — it's generated fresh in every CI run.

---

## How It Works

1. Push to the `main-android` branch triggers the workflow.
2. CI builds the Angular app, installs Capacitor, generates the Android project, builds and signs the APK & AAB.
3. The signed files are **committed to the `releases/` folder** of the `main-android` branch — browse them directly in GitHub.
4. Both files are also uploaded as **GitHub Actions artifacts** (downloadable for 30 days) from the Actions tab.
5. If you push a **git tag**, a GitHub Release is also created with both files attached.

---

## GitHub Secrets Setup

Add these secrets in **Settings → Secrets and variables → Actions**:

| Secret              | Required       | Description                                           |
| ------------------- | -------------- | ----------------------------------------------------- |
| `PASSWORD_HASH`     | Yes            | App password hash (already used by gh-pages workflow) |
| `TOKEN_HASH`        | Yes            | App token (already used by gh-pages workflow)         |
| `KEYSTORE_BASE64`   | For signed APK | Base64-encoded `.jks` keystore file                   |
| `KEYSTORE_PASSWORD` | For signed APK | Keystore password                                     |
| `KEY_ALIAS`         | For signed APK | Key alias inside the keystore                         |
| `KEY_PASSWORD`      | For signed APK | Key password                                          |

> Without the keystore secrets, the workflow still produces an **unsigned APK** (good for testing).

---

## How to Create & Sign a Keystore

### Step 1: Generate a keystore

```bash
keytool -genkeypair \
  -v \
  -storetype JKS \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass 'YOUR_STORE_PASSWORD' \
  -keypass 'YOUR_KEY_PASSWORD' \
  -alias expenzo \
  -keystore release-keystore.jks \
  -dname "CN=Expenzo, OU=Mobile, O=Expenzo, L=City, ST=State, C=IN"
```

> **Important:** Always wrap passwords in **single quotes** (`'...'`) in bash. Double quotes allow `$`, `!`, `@` etc. to be interpreted as special characters, which silently changes the password.

### Step 2: Base64-encode it for GitHub Secrets

```bash
# Option A — save to a file (easier to copy)
base64 -w 0 release-keystore.jks > keystore.b64.txt

# Option B — print directly to terminal
base64 -w 0 release-keystore.jks
```

Open `keystore.b64.txt` (or copy terminal output) and save it as the `KEYSTORE_BASE64` secret.

### Step 3: Add remaining secrets

| Secret              | Value                 |
| ------------------- | --------------------- |
| `KEYSTORE_PASSWORD` | `YOUR_STORE_PASSWORD` |
| `KEY_ALIAS`         | `expenzo`             |
| `KEY_PASSWORD`      | `YOUR_KEY_PASSWORD`   |

### Important

- **Never commit** `release-keystore.jks` to the repo.
- **Back up** the keystore file securely. Losing it means you can never update your Play Store app.

---

## Changing the App ID / Name

Edit `capacitor.config.ts`:

```ts
const config: CapacitorConfig = {
  appId: 'com.yourname.expenzo', // Unique ID on Play Store
  appName: 'Expenzo', // Display name on device
  webDir: 'dist/expenzo/browser',
  // ...
};
```

> The `appId` must follow reverse domain format and **cannot be changed** after publishing to the Play Store.

---

## Changing Supported Android Versions

The default Capacitor Android project targets:

- **minSdkVersion**: 22 (Android 5.1 Lollipop) — ~99% of devices
- **targetSdkVersion**: 34 (Android 14)

### Check current values

After `npx cap add android`, the values live in `android/variables.gradle`:

```bash
cat android/variables.gradle | grep -E 'minSdk|targetSdk'
```

### Change in CI workflow

Add a step after `npx cap add android`:

```yaml
- name: Set Android SDK versions
  working-directory: android
  run: |
    sed -i 's/minSdkVersion = .*/minSdkVersion = 26/' variables.gradle
    sed -i 's/targetSdkVersion = .*/targetSdkVersion = 35/' variables.gradle
```

Common values:

| minSdkVersion | Android Version | Device coverage |
| ------------- | --------------- | --------------- |
| 22            | 5.1 Lollipop    | ~99%            |
| 24            | 7.0 Nougat      | ~97%            |
| 26            | 8.0 Oreo        | ~93%            |
| 28            | 9.0 Pie         | ~85%            |

---

## App Version (versionCode & versionName)

Versions are stored in `android-version.json` at the repo root:

```json
{ "versionCode": 1, "versionName": "1.0.0" }
```

- **versionCode** — integer, must increase with every Play Store upload.
- **versionName** — human-readable string shown in device app info.

The CI workflow reads this file and passes values to Gradle automatically.

### Auto-increment (npm scripts)

```bash
npm run android:version         # versionCode +1 only
npm run android:version:patch   # versionCode +1, patch (1.0.1)
npm run android:version:minor   # versionCode +1, minor (1.1.0)
npm run android:version:major   # versionCode +1, major (2.0.0)
```

### Manual update

Open `android-version.json`, edit the values, commit and push to `main-android`.

### Workflow

```bash
npm run android:version:patch
git add android-version.json
git commit -m "chore: bump android version"
git push origin main-android
```

---

## App Icon

The icon is sourced from `public/expenzo.png`. During the CI build, ImageMagick resizes it to all required densities:

| Density    | Size    | Location                    |
| ---------- | ------- | --------------------------- |
| mdpi       | 48×48   | mipmap-mdpi/                |
| hdpi       | 72×72   | mipmap-hdpi/                |
| xhdpi      | 96×96   | mipmap-xhdpi/               |
| xxhdpi     | 144×144 | mipmap-xxhdpi/              |
| xxxhdpi    | 192×192 | mipmap-xxxhdpi/             |
| Play Store | 512×512 | releases/playstore-icon.png |

To change the icon, replace `public/expenzo.png` with a square PNG (≥512×512 px) and push.

---

## Triggering a Build

### Regular build

```bash
git checkout main-android
git merge main        # or cherry-pick changes
git push origin main-android
```

After the workflow finishes, the files are available in **two places**:

- `releases/expenzo-release.apk` and `releases/expenzo-release.aab` — committed directly to the `main-android` branch (browse in GitHub → download)
- **Actions → Android APK & AAB Build → Artifacts** — downloadable for 30 days

### Tagged release (creates GitHub Release)

```bash
git checkout main-android
git tag v1.0.0
git push origin v1.0.0
```

---

## Publishing to Google Play Store

### First-time setup

1. Create a [Google Play Developer account](https://play.google.com/console/) ($25 one-time fee).
2. Go to **All apps → Create app** and fill in the details.
3. Complete the **Store listing** (screenshots, description, etc.).
4. Complete the **Content rating** questionnaire.
5. Set up **Pricing & distribution**.

### Upload the AAB (Play Store)

1. Go to **Production → Create new release** (or use Internal/Closed testing first).
2. Upload the signed `expenzo-release.aab` (download from `releases/` folder in `main-android`).
3. Use `releases/playstore-icon.png` as the store listing icon.
4. Add release notes and submit for review.

### Subsequent updates

1. Run `npm run android:version:patch` (or minor/major as needed).
2. Commit `android-version.json`.
3. Push to `main-android` — CI builds and signs automatically.
4. Download the new AAB from `releases/` and upload to Play Console.

### Play Store requirements

- APK must be **signed** with the same keystore every time.
- `versionCode` must **increase** with each upload.
- Google now recommends **AAB (Android App Bundle)** over APK. To switch, change `assembleRelease` to `bundleRelease` in the workflow and upload the `.aab` file instead.

---

## Switching to AAB (App Bundle) for Play Store

Edit the workflow's Gradle step:

```yaml
- name: Build AAB with Gradle
  working-directory: android
  run: ./gradlew bundleRelease
```

The output will be at `android/app/build/outputs/bundle/release/app-release.aab`. Update the upload/artifact paths accordingly.

---

## Local Development (Optional)

If you want to test locally with Capacitor:

```bash
npm install @capacitor/cli @capacitor/core @capacitor/android
npm run build
npx cap add android
npx cap sync
npx cap open android   # Opens in Android Studio
```

This is **not required** — the CI workflow handles everything.
