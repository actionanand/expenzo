import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type HelpTab = 'sheets' | 'android';

@Component({
  selector: 'app-help',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="help-page">
      <header class="help-header">
        <a routerLink="/" class="back-btn" aria-label="Back to dashboard">&larr;</a>
        <h1 class="help-title">Help & Setup Guide</h1>
      </header>

      <nav class="help-tabs" role="tablist" aria-label="Help sections">
        <button
          role="tab"
          class="tab-btn"
          [class.active]="activeTab() === 'sheets'"
          [attr.aria-selected]="activeTab() === 'sheets'"
          (click)="activeTab.set('sheets')"
        >
          📊 Google Sheets
        </button>
        <button
          role="tab"
          class="tab-btn"
          [class.active]="activeTab() === 'android'"
          [attr.aria-selected]="activeTab() === 'android'"
          (click)="activeTab.set('android')"
        >
          🤖 Android App
        </button>
      </nav>

      <!-- ═══════════════ SHEETS TAB ═══════════════ -->
      @if (activeTab() === 'sheets') {
        <div class="help-content" role="tabpanel">
          <!-- Functions Overview -->
          <section class="help-section">
            <h2 class="section-heading">Functions Overview</h2>
            <div class="table-wrap">
              <table class="info-table">
                <thead>
                  <tr>
                    <th>Function</th>
                    <th>Purpose</th>
                    <th>Run How Many Times</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>rotateMonthlyTabs()</code></td>
                    <td>Create/update monthly sheets</td>
                    <td>First setup + whenever category/income template changes</td>
                  </tr>
                  <tr>
                    <td><code>createMonthlyTrigger()</code></td>
                    <td>Create monthly automation trigger</td>
                    <td class="highlight-warn">ONLY ONE TIME</td>
                  </tr>
                  <tr>
                    <td><code>onEdit(e)</code></td>
                    <td>Auto serial number + auto date</td>
                    <td>Automatic</td>
                  </tr>
                  <tr>
                    <td><code>doGet(e)</code></td>
                    <td>API endpoint</td>
                    <td>Automatic via API</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Important Warning -->
          <section class="help-section">
            <div class="alert alert-danger">
              <span class="alert-icon">⚠️</span>
              <div>
                <strong>Trigger Already Exists!</strong>
                <p>
                  If you already see <code>rotateMonthlyTabs</code> in the Triggers section,
                  <strong>DO NOT</strong> run <code>createMonthlyTrigger()</code> again. Duplicate
                  triggers will be created.
                </p>
              </div>
            </div>
          </section>

          <!-- First Time Setup -->
          <section class="help-section">
            <h2 class="section-heading">First Time Setup</h2>
            <div class="step-list">
              <div class="step">
                <span class="step-num">1</span>
                <div class="step-body">
                  <h3>Run rotateMonthlyTabs()</h3>
                  <p>
                    Run manually <strong>ONLY ONE TIME</strong>. This creates previous month sheet,
                    current month sheet, and CONFIG sheet.
                  </p>
                  <div class="code-block">rotateMonthlyTabs()</div>
                </div>
              </div>
              <div class="step">
                <span class="step-num">2</span>
                <div class="step-body">
                  <h3>Run createMonthlyTrigger()</h3>
                  <p>Run <strong>ONLY ONE TIME EVER</strong>. This sets up monthly automation.</p>
                  <div class="code-block">createMonthlyTrigger()</div>
                </div>
              </div>
            </div>
          </section>

          <!-- First Time Deployment -->
          <section class="help-section">
            <h2 class="section-heading">Deploy as Web App</h2>
            <p class="section-desc">
              After first-time setup, deploy the script so it can be accessed via URL.
            </p>
            <div class="step-list">
              <div class="step">
                <span class="step-num">1</span>
                <div class="step-body">
                  <p>Apps Script → <strong>Deploy → New Deployment</strong></p>
                </div>
              </div>
              <div class="step">
                <span class="step-num">2</span>
                <div class="step-body">
                  <p>Choose type:</p>
                  <div class="code-block">Web App</div>
                </div>
              </div>
              <div class="step">
                <span class="step-num">3</span>
                <div class="step-body">
                  <h3>Set access</h3>
                  <div class="tag-row">
                    <span class="tag">Execute As: Me</span>
                    <span class="tag">Who Has Access: Anyone</span>
                  </div>
                  <p>(or <em>Anyone with link</em>)</p>
                </div>
              </div>
              <div class="step">
                <span class="step-num">4</span>
                <div class="step-body">
                  <p>Click <strong>Deploy</strong> and authorize permissions.</p>
                </div>
              </div>
            </div>
            <div class="alert alert-success">
              <span class="alert-icon">✅</span>
              <div>
                <strong>You will get a URL like:</strong>
                <div class="code-block">https://script.google.com/macros/s/XXXXX/exec</div>
              </div>
            </div>
          </section>

          <!-- When Category Changes -->
          <section class="help-section">
            <h2 class="section-heading">When Category List Changes</h2>
            <p class="section-desc">
              After adding, removing, or renaming categories in the script:
            </p>
            <div class="action-card">
              <span class="action-label">Run once:</span>
              <div class="code-block">rotateMonthlyTabs()</div>
            </div>
            <p class="section-desc">
              This updates dropdowns, category validation, and Uncategorized fallback.
            </p>
            <div class="alert alert-info">
              <span class="alert-icon">ℹ️</span>
              <div>
                <strong>Removed categories</strong> — Old entries with removed categories become
                <code>Uncategorized</code> after running the function.
              </div>
            </div>
          </section>

          <!-- When Income Template Changes -->
          <section class="help-section">
            <h2 class="section-heading">When Default Income Template Changes</h2>
            <p class="section-desc">After adding or modifying income sources in the script:</p>
            <div class="action-card">
              <span class="action-label">Run once:</span>
              <div class="code-block">rotateMonthlyTabs()</div>
            </div>
            <div class="alert alert-info">
              <span class="alert-icon">ℹ️</span>
              <div>
                <strong>Income behaviour:</strong> Current/latest month income snapshot gets copied
                to future months. Old months remain unchanged — historical accuracy is preserved.
              </div>
            </div>
          </section>

          <!-- When Script Logic Changes -->
          <section class="help-section">
            <h2 class="section-heading">When Script Logic Changes</h2>
            <p class="section-desc">
              After editing API response, calculations, auto-date, summary logic, shortage logic,
              category logic, or transaction parsing — <strong>you MUST redeploy</strong>.
            </p>
            <div class="step-list">
              <div class="step">
                <span class="step-num">1</span>
                <div class="step-body">
                  <p>Open <strong>Deploy → Manage Deployments</strong></p>
                </div>
              </div>
              <div class="step">
                <span class="step-num">2</span>
                <div class="step-body">
                  <p>Click the <strong>Edit (Pencil Icon)</strong></p>
                </div>
              </div>
              <div class="step">
                <span class="step-num">3</span>
                <div class="step-body">
                  <p>Choose <strong>New Version</strong> from the Version dropdown</p>
                  <div class="alert alert-danger compact">
                    <span class="alert-icon">⚠️</span>
                    <span>This step is critical — always select <strong>New Version</strong></span>
                  </div>
                </div>
              </div>
              <div class="step">
                <span class="step-num">4</span>
                <div class="step-body">
                  <p>Click <strong>Deploy</strong></p>
                </div>
              </div>
            </div>
            <div class="alert alert-success">
              <span class="alert-icon">✅</span>
              <div>
                No need to create new deployment, trigger, or change API URL. Existing URL continues
                working.
              </div>
            </div>
          </section>

          <!-- Sheet Structure -->
          <section class="help-section">
            <h2 class="section-heading">Expense Sheet Structure</h2>
            <div class="structure-grid">
              <div class="structure-card">
                <h3>Row 1–6 — Income Snapshot</h3>
                <div class="table-wrap">
                  <table class="info-table compact">
                    <tbody>
                      <tr>
                        <td>Salary</td>
                        <td>40000</td>
                      </tr>
                      <tr>
                        <td>Bonus</td>
                        <td>10000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="structure-card">
                <h3>Row 12 — Transaction Headers</h3>
                <div class="tag-row">
                  <span class="tag">S No</span>
                  <span class="tag">Name</span>
                  <span class="tag">Category</span>
                  <span class="tag">Price</span>
                  <span class="tag">Date</span>
                </div>
              </div>
              <div class="structure-card">
                <h3>Row 13+ — Transactions</h3>
                <p>Your expense entries live here</p>
              </div>
            </div>
          </section>

          <!-- Auto Features -->
          <section class="help-section">
            <h2 class="section-heading">Auto Features</h2>
            <div class="feature-grid">
              <div class="feature-card">
                <span class="feature-icon">🔢</span>
                <h3>Serial Number</h3>
                <p>Auto-generated when Name field is entered. Manual editing still allowed.</p>
              </div>
              <div class="feature-card">
                <span class="feature-icon">📅</span>
                <h3>Date</h3>
                <p>
                  Today's date auto-filled when Name/Category/Price is entered. Manual editing
                  allowed.
                </p>
              </div>
            </div>
          </section>

          <!-- Architecture -->
          <section class="help-section">
            <h2 class="section-heading">Architecture</h2>
            <div class="feature-grid">
              <div class="feature-card">
                <span class="feature-icon">📂</span>
                <h3>Categories</h3>
                <p><strong>Global</strong> — shared across all months</p>
              </div>
              <div class="feature-card">
                <span class="feature-icon">💰</span>
                <h3>Income</h3>
                <p><strong>Month-wise snapshot</strong> — preserves historical accuracy</p>
              </div>
            </div>
          </section>

          <!-- Auto Month Creation -->
          <section class="help-section">
            <h2 class="section-heading">Automatic Month Creation</h2>
            <p class="section-desc">
              Every month on day 1, <code>rotateMonthlyTabs()</code> runs automatically and creates
              the next month sheet using the latest income snapshot.
            </p>
            <div class="alert alert-info">
              <span class="alert-icon">ℹ️</span>
              <div>
                Maximum <strong>12 tabs</strong>. Oldest month is automatically reused for newest
                month.
              </div>
            </div>
          </section>

          <!-- When to Delete Old Sheets -->
          <section class="help-section">
            <h2 class="section-heading">When to Delete Old Sheets</h2>
            <p class="section-desc">Delete old month sheets <strong>ONLY IF</strong>:</p>
            <ul class="bullet-list">
              <li>Structure changed heavily</li>
              <li>Testing corrupted data</li>
              <li>Old header positions mismatch (e.g. V1 → V2 migration)</li>
            </ul>
            <p class="section-desc">
              Normal future updates do <strong>NOT</strong> require deleting sheets.
            </p>
          </section>

          <!-- Stockpile / Wishlist Sheet -->
          <section class="help-section">
            <h2 class="section-heading">Stockpile (Wishlist) Sheet Setup</h2>
            <div class="step-list">
              <div class="step">
                <span class="step-num">1</span>
                <div class="step-body">
                  <h3>Open Apps Script</h3>
                  <p>
                    In your Google Sheet: Click <strong>Extensions → Apps Script</strong>. Remove
                    existing code and paste the script. Save and give the project any name.
                  </p>
                </div>
              </div>
              <div class="step">
                <span class="step-num">2</span>
                <div class="step-body">
                  <h3>Add Reset Button in Sheet</h3>
                  <p>
                    Go to your Google Sheet → Click <strong>Insert → Drawing</strong> → Create a
                    shape/button → Add text like <code>Reset Sheet</code> → Save and place it.
                  </p>
                </div>
              </div>
              <div class="step">
                <span class="step-num">3</span>
                <div class="step-body">
                  <h3>Assign Script to Button</h3>
                  <p>
                    Click the button → Click the <strong>3 dots</strong> → Select
                    <strong>Assign script</strong> → Enter:
                  </p>
                  <div class="code-block">resetInventorySheet</div>
                  <p>Click OK.</p>
                </div>
              </div>
              <div class="step">
                <span class="step-num">4</span>
                <div class="step-body">
                  <h3>First Time Authorization</h3>
                  <p>
                    First click will ask for permission: Continue → Select Google account → Allow
                    permissions. After that, one click resets the sheet.
                  </p>
                </div>
              </div>
            </div>
            <div class="table-wrap">
              <table class="info-table">
                <thead>
                  <tr>
                    <th>S No</th>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Apple</td>
                    <td>2.5</td>
                    <td>Kg</td>
                    <td>Buy water Apple</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Oil</td>
                    <td>—</td>
                    <td>Liters</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>Laptop</td>
                    <td>1</td>
                    <td>Nos</td>
                    <td>Dell laptop</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="alert alert-info">
              <span class="alert-icon">ℹ️</span>
              <div>
                The Stockpile sheet is read via Google Visualization API (gviz). Only rows with a
                valid <strong>S No</strong> are shown. Comment column is optional.
              </div>
            </div>
          </section>

          <!-- API Info -->
          <section class="help-section">
            <h2 class="section-heading">API URL Format</h2>
            <div class="code-block">
              https://script.google.com/macros/s/XXXXX/exec?token=MY_SECRET_KEY
            </div>
            <p class="section-desc">
              Returns config, cycleStartDay, category limits, month-wise income, summary, category
              summary, and transactions.
            </p>
          </section>
        </div>
      }

      <!-- ═══════════════ ANDROID TAB ═══════════════ -->
      @if (activeTab() === 'android') {
        <div class="help-content" role="tabpanel">
          <!-- How it works -->
          <section class="help-section">
            <h2 class="section-heading">How It Works</h2>
            <p class="section-desc">
              The Android app is built entirely in GitHub Actions using Capacitor. No Android
              tooling needed locally — just push to the <code>main-android</code> branch.
            </p>
            <div class="flow-steps">
              <div class="flow-step">
                <span class="flow-icon">🔨</span><span>Angular build</span>
              </div>
              <span class="flow-arrow">→</span>
              <div class="flow-step">
                <span class="flow-icon">📦</span><span>Capacitor sync</span>
              </div>
              <span class="flow-arrow">→</span>
              <div class="flow-step">
                <span class="flow-icon">🤖</span><span>Gradle build</span>
              </div>
              <span class="flow-arrow">→</span>
              <div class="flow-step">
                <span class="flow-icon">🔐</span><span>Sign APK/AAB</span>
              </div>
              <span class="flow-arrow">→</span>
              <div class="flow-step">
                <span class="flow-icon">📥</span><span>Saved to branch</span>
              </div>
            </div>
          </section>

          <!-- Trigger a build -->
          <section class="help-section">
            <h2 class="section-heading">Trigger a Build</h2>
            <p class="section-desc">
              Push any change to the <code>main-android</code> branch to start the workflow.
            </p>
            <div class="code-block">
              git checkout main-android git merge main git push origin main-android
            </div>
          </section>

          <!-- Download the APK / AAB -->
          <section class="help-section">
            <h2 class="section-heading">Download the APK / AAB</h2>
            <p class="section-desc">After the workflow finishes, files are in two places:</p>
            <div class="step-list">
              <div class="step">
                <span class="step-num">1</span>
                <div class="step-body">
                  <h3>releases/ folder (permanent)</h3>
                  <p>
                    GitHub repo → switch to branch <strong>main-android</strong> → open the
                    <strong>releases/</strong> folder → download <code>expenzo-release.apk</code> or
                    <code>expenzo-release.aab</code>.
                  </p>
                </div>
              </div>
              <div class="step">
                <span class="step-num">2</span>
                <div class="step-body">
                  <h3>Actions Artifacts (30-day expiry)</h3>
                  <p>
                    GitHub repo → <strong>Actions</strong> → latest
                    <em>Android APK &amp; AAB Build</em> run → scroll to
                    <strong>Artifacts</strong> → download.
                  </p>
                </div>
              </div>
            </div>
            <div class="alert alert-info">
              <span class="alert-icon">ℹ️</span>
              <div>
                <strong>APK</strong> (Android Package Kit) — install directly on a device
                (sideload).<br />
                <strong>AAB</strong> (Android App Bundle) — required for Play Store uploads.
              </div>
            </div>
          </section>

          <!-- App Version -->
          <section class="help-section">
            <h2 class="section-heading">App Version (versionCode & versionName)</h2>
            <p class="section-desc">
              Versions are stored in <code>android-version.json</code>. The CI
              <strong>automatically increments versionCode on every build</strong> and commits the
              updated file to <code>main-android</code>.
            </p>
            <div class="code-block">&#123; "versionCode": 1, "versionName": "1.0.0" &#125;</div>
            <p class="section-desc">
              <strong>versionCode</strong> — auto-incremented by CI on each push to
              <code>main-android</code>. On the <code>main</code> branch it stays at its initial
              value — this is normal.<br />
              <strong>versionName</strong> — update manually only when marking a new release.
            </p>
            <div class="alert alert-info">
              <span class="alert-icon">ℹ️</span>
              <div>
                You should <strong>never need to edit versionCode</strong>. If you do change it on
                <code>main-android</code>, CI will increment from your new value on the next build.
              </div>
            </div>
            <h3 class="subsection-heading">Bump versionName (when needed)</h3>
            <div class="table-wrap">
              <table class="info-table">
                <thead>
                  <tr>
                    <th>Command</th>
                    <th>Effect</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>npm run android:version:patch</code></td>
                    <td>1.0.0 → 1.0.1</td>
                  </tr>
                  <tr>
                    <td><code>npm run android:version:minor</code></td>
                    <td>1.0.0 → 1.1.0</td>
                  </tr>
                  <tr>
                    <td><code>npm run android:version:major</code></td>
                    <td>1.0.0 → 2.0.0</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="alert alert-info">
              <span class="alert-icon">ℹ️</span>
              <div>
                After running the command, commit <code>android-version.json</code> and push to
                <code>main-android</code>. CI will auto-increment versionCode on top of the new
                name.
              </div>
            </div>
          </section>

          <!-- Android Version Support -->
          <section class="help-section">
            <h2 class="section-heading">Android Version Support</h2>
            <p class="section-desc">The app currently targets:</p>
            <div class="table-wrap">
              <table class="info-table">
                <thead>
                  <tr>
                    <th>Setting</th>
                    <th>Value</th>
                    <th>Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>minSdkVersion</code></td>
                    <td>22</td>
                    <td>Minimum: Android 5.1 (Lollipop) — ~99% devices</td>
                  </tr>
                  <tr>
                    <td><code>targetSdkVersion</code></td>
                    <td>35</td>
                    <td>Target: Android 15 — app optimised for this version</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3 class="subsection-heading">When a new Android version is released</h3>
            <p class="section-desc">
              Google requires apps to target the latest SDK within ~12 months of release. Edit the
              <code>env:</code> block near the top of
              <code>.github/workflows/android-build.yml</code>:
            </p>
            <div class="code-block">TARGET_SDK_VERSION: 36 # Android 16</div>
            <p class="section-desc">
              To change minimum device support, update <code>MIN_SDK_VERSION</code> in the same
              block:
            </p>
            <div class="code-block">MIN_SDK_VERSION: 26 # Android 8.0 Oreo</div>
            <div class="table-wrap">
              <table class="info-table">
                <thead>
                  <tr>
                    <th>minSdkVersion</th>
                    <th>Android</th>
                    <th>Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>22</td>
                    <td>5.1 Lollipop</td>
                    <td>~99%</td>
                  </tr>
                  <tr>
                    <td>24</td>
                    <td>7.0 Nougat</td>
                    <td>~97%</td>
                  </tr>
                  <tr>
                    <td>26</td>
                    <td>8.0 Oreo</td>
                    <td>~93%</td>
                  </tr>
                  <tr>
                    <td>28</td>
                    <td>9.0 Pie</td>
                    <td>~85%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- App Icon -->
          <section class="help-section">
            <h2 class="section-heading">App Icon</h2>
            <p class="section-desc">
              The icon is read from <code>public/expenzo.png</code> and automatically resized to all
              required Android densities during the CI build using ImageMagick. The
              <code>releases/</code> folder also gets a 512×512 <code>playstore-icon.png</code>
              ready for the Play Store listing.
            </p>
            <div class="table-wrap">
              <table class="info-table">
                <thead>
                  <tr>
                    <th>Density</th>
                    <th>Size</th>
                    <th>Used for</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>mdpi</td>
                    <td>48×48</td>
                    <td>Low-density screens</td>
                  </tr>
                  <tr>
                    <td>hdpi</td>
                    <td>72×72</td>
                    <td>Medium screens</td>
                  </tr>
                  <tr>
                    <td>xhdpi</td>
                    <td>96×96</td>
                    <td>High-density screens</td>
                  </tr>
                  <tr>
                    <td>xxhdpi</td>
                    <td>144×144</td>
                    <td>Extra-high screens</td>
                  </tr>
                  <tr>
                    <td>xxxhdpi</td>
                    <td>192×192</td>
                    <td>Flagship devices</td>
                  </tr>
                  <tr>
                    <td>Play Store</td>
                    <td>512×512</td>
                    <td>Store listing icon</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="alert alert-info">
              <span class="alert-icon">ℹ️</span>
              <div>
                To change the icon, replace <code>public/expenzo.png</code> with a square PNG (at
                least 512×512 px) and push.
              </div>
            </div>
          </section>

          <!-- Keystore Setup -->
          <section class="help-section">
            <h2 class="section-heading">Keystore Setup (One-Time)</h2>
            <p class="section-desc">
              Without a keystore the build still succeeds but produces an <strong>unsigned</strong>
              APK/AAB. Unsigned files cannot be uploaded to the Play Store.
            </p>
            <div class="step-list">
              <div class="step">
                <span class="step-num">1</span>
                <div class="step-body">
                  <h3>Generate keystore</h3>
                  <p>
                    Run in terminal. Use <strong>single quotes</strong> around passwords — double
                    quotes allow <code>$</code>, <code>!</code> to be expanded by the shell,
                    silently changing your password.
                  </p>
                  <div class="code-block">
                    keytool -genkeypair -v -storetype JKS -keyalg RSA -keysize 2048 -validity 10000
                    -storepass 'YOUR_STORE_PASSWORD' -keypass 'YOUR_KEY_PASSWORD' -alias expenzo
                    -keystore release-keystore.jks -dname "CN=Expenzo,O=Expenzo,C=IN"
                  </div>
                </div>
              </div>
              <div class="step">
                <span class="step-num">2</span>
                <div class="step-body">
                  <h3>Encode to base64</h3>
                  <p>Save to file (recommended)</p>
                  <div class="code-block">base64 -w 0 release-keystore.jks > keystore.b64.txt</div>

                  <p>(alternative) print directly to terminal and copy output</p>
                  <div class="code-block">base64 -w 0 release-keystore.jks</div>
                  <p>Open <code>keystore.b64.txt</code> and copy all its contents.</p>
                </div>
              </div>
              <div class="step">
                <span class="step-num">3</span>
                <div class="step-body">
                  <h3>Add GitHub Secrets</h3>
                  <p>
                    <strong
                      >Settings → Secrets and variables → Actions → New repository secret</strong
                    >
                  </p>
                  <div class="table-wrap">
                    <table class="info-table">
                      <thead>
                        <tr>
                          <th>Secret name</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><code>KEYSTORE_BASE64</code></td>
                          <td>Contents of keystore.b64.txt</td>
                        </tr>
                        <tr>
                          <td><code>KEYSTORE_PASSWORD</code></td>
                          <td>Your store password</td>
                        </tr>
                        <tr>
                          <td><code>KEY_ALIAS</code></td>
                          <td>expenzo</td>
                        </tr>
                        <tr>
                          <td><code>KEY_PASSWORD</code></td>
                          <td>Your key password</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div class="alert alert-danger">
              <span class="alert-icon">⚠️</span>
              <div>
                <strong>Never commit</strong> <code>release-keystore.jks</code> to the repo. Back it
                up securely — losing it means you can never update your Play Store app.
              </div>
            </div>
          </section>

          <!-- Upload to Play Store -->
          <section class="help-section">
            <h2 class="section-heading">Upload to Play Store</h2>
            <div class="step-list">
              <div class="step">
                <span class="step-num">1</span>
                <div class="step-body">
                  <h3>Create Developer Account</h3>
                  <p>
                    Go to <strong>play.google.com/console</strong> and register ($25 one-time fee).
                  </p>
                </div>
              </div>
              <div class="step">
                <span class="step-num">2</span>
                <div class="step-body">
                  <h3>Create App</h3>
                  <p>
                    <strong>All apps → Create app</strong> → fill in name, language, app/game,
                    free/paid.
                  </p>
                </div>
              </div>
              <div class="step">
                <span class="step-num">3</span>
                <div class="step-body">
                  <h3>Complete Store Listing</h3>
                  <p>
                    Add description, screenshots (min 2), feature graphic, and icon (use
                    <code>releases/playstore-icon.png</code>).
                  </p>
                </div>
              </div>
              <div class="step">
                <span class="step-num">4</span>
                <div class="step-body">
                  <h3>Upload AAB</h3>
                  <p>
                    <strong>Production → Create new release</strong> (or start with
                    <em>Internal testing</em>) → upload <code>expenzo-release.aab</code> → add
                    release notes → Review and submit.
                  </p>
                </div>
              </div>
            </div>
            <div class="alert alert-info">
              <span class="alert-icon">ℹ️</span>
              <div>
                Each upload must have a <strong>higher versionCode</strong>. Run
                <code>npm run android:version:patch</code> and commit before pushing to
                <code>main-android</code>.
              </div>
            </div>
          </section>

          <!-- Signed vs Unsigned -->
          <section class="help-section">
            <h2 class="section-heading">Signed vs Unsigned</h2>
            <div class="feature-grid">
              <div class="feature-card">
                <span class="feature-icon">🔐</span>
                <h3>Signed</h3>
                <p>Requires all 4 keystore secrets. Works for Play Store and sideloading.</p>
              </div>
              <div class="feature-card">
                <span class="feature-icon">🔓</span>
                <h3>Unsigned</h3>
                <p>
                  Built if keystore fails or is missing. Good for testing. Not accepted by Play
                  Store.
                </p>
              </div>
            </div>
            <p class="section-desc">
              If signing fails, the workflow shows a ⚠️ warning annotation in the Actions log
              explaining why. The build does <strong>not</strong> fail — unsigned files are still
              saved.
            </p>
          </section>
        </div>
      }
    </div>
  `,
  styleUrl: './help.scss',
})
export class Help {
  protected readonly activeTab = signal<HelpTab>('sheets');
}
