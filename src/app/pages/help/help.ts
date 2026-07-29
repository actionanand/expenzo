import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';

type HelpTab = 'guide' | 'sheets' | 'android';

@Component({
  selector: 'app-help',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon, RouterLink],
  template: `
    <div class="help-page">
      <div class="help-navigation">
        <header class="help-header">
          <a routerLink="/" class="back-btn" aria-label="Back to dashboard">
            <svg lucideIcon="chevron-right" aria-hidden="true"></svg>
          </a>
          <h1 class="help-title">Help & Setup Guide</h1>
        </header>

        <nav class="help-tabs" role="tablist" aria-label="Help sections">
          <button
            id="help-tab-guide"
            role="tab"
            class="tab-btn"
            [class.active]="activeTab() === 'guide'"
            [attr.aria-selected]="activeTab() === 'guide'"
            [attr.tabindex]="activeTab() === 'guide' ? 0 : -1"
            aria-controls="help-panel-guide"
            (click)="activeTab.set('guide')"
            (keydown)="onTabKeydown($event)"
          >
            <svg lucideIcon="gauge" aria-hidden="true"></svg>
            App Guide
          </button>
          <button
            id="help-tab-sheets"
            role="tab"
            class="tab-btn"
            [class.active]="activeTab() === 'sheets'"
            [attr.aria-selected]="activeTab() === 'sheets'"
            [attr.tabindex]="activeTab() === 'sheets' ? 0 : -1"
            aria-controls="help-panel-sheets"
            (click)="activeTab.set('sheets')"
            (keydown)="onTabKeydown($event)"
          >
            <svg lucideIcon="file-spreadsheet" aria-hidden="true"></svg>
            Sheets
          </button>
          <button
            id="help-tab-android"
            role="tab"
            class="tab-btn"
            [class.active]="activeTab() === 'android'"
            [attr.aria-selected]="activeTab() === 'android'"
            [attr.tabindex]="activeTab() === 'android' ? 0 : -1"
            aria-controls="help-panel-android"
            (click)="activeTab.set('android')"
            (keydown)="onTabKeydown($event)"
          >
            <svg lucideIcon="settings-2" aria-hidden="true"></svg>
            Android
          </button>
        </nav>
      </div>

      <!-- ═══════════════ APP GUIDE TAB ═══════════════ -->
      @if (activeTab() === 'guide') {
        <div
          id="help-panel-guide"
          class="help-content"
          role="tabpanel"
          aria-labelledby="help-tab-guide"
          tabindex="0"
        >
          <section class="help-section">
            <h2 class="section-heading">Understanding Your Dashboard</h2>
            <p class="section-desc">
              Dashboard amounts describe two different things: your cash flow and your spending
              plan. Balance belongs to cash flow; available to spend belongs to the budget.
            </p>

            <dl class="metric-list">
              <div class="metric-row">
                <dt>Income</dt>
                <dd>
                  Total income recorded for the selected budget cycle. It is used to calculate your
                  balance.
                </dd>
                <code>Income = sum of income entries</code>
              </div>
              <div class="metric-row">
                <dt>Expense</dt>
                <dd>Total of all expense transactions in the selected budget cycle.</dd>
                <code>Expense = sum of transactions</code>
              </div>
              <div class="metric-row">
                <dt>Balance</dt>
                <dd>
                  Income left after expenses. This is a cash-flow result and is not your remaining
                  category budget.
                </dd>
                <code>Balance = income - expense</code>
              </div>
              <div class="metric-row">
                <dt>Budget</dt>
                <dd>
                  Total of all category limits, such as Grocery, Fuel, and Medicine. It is your
                  spending plan and can be different from income.
                </dd>
                <code>Budget = sum of category limits</code>
              </div>
              <div class="metric-row">
                <dt>Available to spend</dt>
                <dd>
                  Amount remaining inside the category budget. A negative value means the overall
                  budget has been exceeded.
                </dd>
                <code>Available = budget - expense</code>
              </div>
              <div class="metric-row">
                <dt>Budget used</dt>
                <dd>
                  Percentage of the total category budget already spent. Values above 100% mean
                  overspending.
                </dd>
                <code>Used % = expense / budget x 100</code>
              </div>
              <div class="metric-row">
                <dt>Actual spent</dt>
                <dd>
                  Expense transactions recorded so far in the selected cycle. This is a historical
                  total, not an estimate.
                </dd>
                <code>Actual spent = sum of expense transactions</code>
              </div>
              <div class="metric-row">
                <dt>Spent per day</dt>
                <dd>
                  Average spending for each elapsed day in the cycle. This describes your pace; it
                  is not a daily spending allowance.
                </dd>
                <code>Spent/day = actual spent / days elapsed</code>
              </div>
              <div class="metric-row">
                <dt>Projected total</dt>
                <dd>
                  Estimated final expense if your actual spending pace continues. It uses actual
                  spent as its starting point, but it is a forecast and is not the same as actual
                  spent. Completed cycles show actual spent instead.
                </dd>
                <code>Projected = spent/day x cycle length</code>
              </div>
              <div class="metric-row">
                <dt>Income capacity per day</dt>
                <dd>
                  Income divided across the whole cycle. This is the maximum cash-flow capacity, not
                  a recommended spending target.
                </dd>
                <code>Income/day = income / cycle days</code>
              </div>
              <div class="metric-row">
                <dt>Budget allowance per day</dt>
                <dd>
                  Total category budget divided across the cycle. This is the safer daily amount for
                  following your spending plan.
                </dd>
                <code>Budget/day = category budget / cycle days</code>
              </div>
              <div class="metric-row">
                <dt>Capacity or allowance to date</dt>
                <dd>
                  Daily income capacity or budget allowance accumulated through the elapsed days.
                  Expenzo compares actual spent with both amounts separately.
                </dd>
                <code>To date = per-day amount x days elapsed</code>
              </div>
              <div class="metric-row">
                <dt>Days left</dt>
                <dd>
                  Calendar days remaining in the selected cycle, including today. Completed cycles
                  show zero.
                </dd>
              </div>
            </dl>
          </section>

          <section class="help-section">
            <h2 class="section-heading">Worked Example</h2>
            <p class="section-desc">
              With ₹32,000 income, ₹24,591 expenses, and ₹24,800 in category budgets:
            </p>
            <div class="calculation-example">
              <p><strong>Balance:</strong> ₹32,000 - ₹24,591 = <strong>₹7,409</strong></p>
              <p>
                <strong>Available to spend:</strong> ₹24,800 - ₹24,591 =
                <strong>₹209</strong>
              </p>
              <p>
                <strong>Budget used:</strong> ₹24,591 / ₹24,800 = approximately
                <strong>99%</strong>
              </p>
            </div>
            <div class="alert alert-info">
              <svg class="alert-icon" lucideIcon="circle-help" aria-hidden="true"></svg>
              <div>
                <strong>Why balance and available are different</strong>
                <p>
                  Balance compares income with expenses. Available to spend compares the category
                  budget with expenses. Neither number is wrong; they answer different questions.
                </p>
              </div>
            </div>
          </section>

          <section class="help-section">
            <h2 class="section-heading">Daily Pace Example</h2>
            <p class="section-desc">
              For ₹60,000 income, an ₹8,000 category budget, and a 30-day cycle:
            </p>
            <div class="calculation-example">
              <p>
                <strong>Income capacity:</strong> ₹60,000 / 30 =
                <strong>₹2,000 per day</strong>
              </p>
              <p>
                <strong>Budget allowance:</strong> ₹8,000 / 30 =
                <strong>approximately ₹267 per day</strong>
              </p>
              <p>
                <strong>After 3 elapsed days:</strong> income capacity is
                <strong>₹6,000</strong> and budget allowance is <strong>₹800</strong>.
              </p>
            </div>
            <p class="section-desc">
              If actual spent after those three days is ₹900, Expenzo shows ₹5,100 left against
              income capacity, but ₹100 over the budget pace. The two results are deliberately
              separate because income and budget answer different questions.
            </p>
          </section>

          <section class="help-section">
            <h2 class="section-heading">Budget Cycles and Dates</h2>
            <ul class="guide-list">
              <li>
                The Cycle setting chooses the first day of each budget period. Cycle 25 means a
                period such as 25 July through 24 August.
              </li>
              <li>
                Fixed choices 2, 3, and 28 run through the previous calendar day in the following
                month. Last day and Second-last day adapt automatically for 28, 29, 30, and 31-day
                months.
              </li>
              <li>
                Use the previous and next arrows to review another cycle. Past periods show a Cycle
                review with actual spend, budget use, daily average, category results, and a
                comparison with the preceding cycle. Select an over-limit category result to reveal
                the affected categories and their overage.
              </li>
              <li>
                Changing the cycle start day changes how transactions are grouped; it does not alter
                transaction dates or amounts.
              </li>
              <li>
                Expenzo converts API timestamps to Indian Standard Time (Asia/Kolkata, UTC+05:30)
                before assigning a transaction to a calendar day or budget cycle.
              </li>
              <li>
                Category limits are added together to form the displayed total budget. Update the
                source sheet when a category limit is incorrect.
              </li>
            </ul>
          </section>

          <section class="help-section">
            <h2 class="section-heading">Category Breakdown</h2>
            <ul class="guide-list">
              <li><strong>Left</strong> shows the category limit minus category spending.</li>
              <li><strong>Over by</strong> appears when spending exceeds that category limit.</li>
              <li>
                A category can be over budget even when the overall budget still has money
                available.
              </li>
              <li>
                Transactions without a matching configured category may not contribute to the
                category-limit total, but they still count as expenses.
              </li>
            </ul>
          </section>

          <section class="help-section">
            <h2 class="section-heading">Data, Exports, and Security</h2>
            <ul class="guide-list">
              <li>
                Pull down on supported lists to refresh. When offline, Expenzo can show cached data;
                reconnect to receive the latest sheet changes.
              </li>
              <li>
                A “Sample data” banner means the API token or endpoint has not been verified, so
                dashboard values are examples rather than production data.
              </li>
              <li>
                Home exports use the cycle currently being viewed. The Transactions page can export
                the current cycle, a selected range of cycles, or all available history. Transaction
                exports also respect the active category and search filters.
              </li>
              <li>
                On Android, CSV and PDF use the native system share sheet so you can save to Files,
                Drive, email, or another supported app. PDF exports are generated as real PDF
                documents with tables.
              </li>
              <li>
                The Transactions tab shows the latest cycle expanded and older cycles collapsed.
                Search works across all cycle history, and category filtering treats differences
                such as “grocery” and “Grocery” as the same category.
              </li>
              <li>
                PIN protection is stored locally on the device. Fingerprint unlock requires a PIN
                first and always keeps PIN as the fallback.
              </li>
              <li>
                PIN recovery asks for the master login password again; a value already stored by the
                browser is not accepted automatically.
              </li>
            </ul>
          </section>
        </div>
      }

      <!-- ═══════════════ SHEETS TAB ═══════════════ -->
      @if (activeTab() === 'sheets') {
        <div
          id="help-panel-sheets"
          class="help-content"
          role="tabpanel"
          aria-labelledby="help-tab-sheets"
          tabindex="0"
        >
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
              <svg class="alert-icon" lucideIcon="shield-off" aria-hidden="true"></svg>
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
              <svg class="alert-icon" lucideIcon="circle-check" aria-hidden="true"></svg>
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
                    <svg class="alert-icon" lucideIcon="shield-off" aria-hidden="true"></svg>
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
              <svg class="alert-icon" lucideIcon="circle-check" aria-hidden="true"></svg>
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
        <div
          id="help-panel-android"
          class="help-content"
          role="tabpanel"
          aria-labelledby="help-tab-android"
          tabindex="0"
        >
          <!-- How it works -->
          <section class="help-section">
            <h2 class="section-heading">How It Works</h2>
            <p class="section-desc">
              The Android app is built entirely in GitHub Actions using Capacitor. No Android
              tooling needed locally — just push to the <code>main-android</code> branch.
            </p>
            <div class="flow-steps">
              <div class="flow-step">
                <svg class="flow-icon" lucideIcon="file-text" aria-hidden="true"></svg>
                <span>Angular build</span>
              </div>
              <svg class="flow-arrow" lucideIcon="chevron-right" aria-hidden="true"></svg>
              <div class="flow-step">
                <svg class="flow-icon" lucideIcon="settings-2" aria-hidden="true"></svg>
                <span>Capacitor sync</span>
              </div>
              <svg class="flow-arrow" lucideIcon="chevron-right" aria-hidden="true"></svg>
              <div class="flow-step">
                <svg class="flow-icon" lucideIcon="monitor-cog" aria-hidden="true"></svg>
                <span>Gradle build</span>
              </div>
              <svg class="flow-arrow" lucideIcon="chevron-right" aria-hidden="true"></svg>
              <div class="flow-step">
                <svg class="flow-icon" lucideIcon="lock-keyhole" aria-hidden="true"></svg>
                <span>Sign APK/AAB</span>
              </div>
              <svg class="flow-arrow" lucideIcon="chevron-right" aria-hidden="true"></svg>
              <div class="flow-step">
                <svg class="flow-icon" lucideIcon="file-text" aria-hidden="true"></svg>
                <span>Saved to branch</span>
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
              <svg class="alert-icon" lucideIcon="shield-off" aria-hidden="true"></svg>
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
                <svg class="feature-icon" lucideIcon="lock-keyhole" aria-hidden="true"></svg>
                <h3>Signed</h3>
                <p>Requires all 4 keystore secrets. Works for Play Store and sideloading.</p>
              </div>
              <div class="feature-card">
                <svg class="feature-icon" lucideIcon="unlock" aria-hidden="true"></svg>
                <h3>Unsigned</h3>
                <p>
                  Built if keystore fails or is missing. Good for testing. Not accepted by Play
                  Store.
                </p>
              </div>
            </div>
            <p class="section-desc">
              If signing fails, the workflow shows a warning annotation in the Actions log
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
  protected readonly activeTab = signal<HelpTab>('guide');
  private readonly tabOrder: readonly HelpTab[] = ['guide', 'sheets', 'android'];

  protected onTabKeydown(event: KeyboardEvent): void {
    const currentIndex = this.tabOrder.indexOf(this.activeTab());
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % this.tabOrder.length;
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + this.tabOrder.length) % this.tabOrder.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = this.tabOrder.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const tab = this.tabOrder[nextIndex];
    this.activeTab.set(tab);
    window.setTimeout(() => document.getElementById(`help-tab-${tab}`)?.focus());
  }
}
