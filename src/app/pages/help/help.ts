import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

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

      <div class="help-content">
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
          <p class="section-desc">After adding, removing, or renaming categories in the script:</p>
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
              <strong>Income behaviour:</strong> Current/latest month income snapshot gets copied to
              future months. Old months remain unchanged — historical accuracy is preserved.
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
    </div>
  `,
  styleUrl: './help.scss',
})
export class Help {}
