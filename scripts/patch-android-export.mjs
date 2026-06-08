import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const appPackage = 'com.actionanand.expenzo.app';
const javaDir = join('android', 'app', 'src', 'main', 'java', ...appPackage.split('.'));
const mainActivityPath = join(javaDir, 'MainActivity.java');
const exportPluginPath = join(javaDir, 'ExpenzoExportPlugin.java');
const manifestPath = join('android', 'app', 'src', 'main', 'AndroidManifest.xml');
const filePathsPath = join('android', 'app', 'src', 'main', 'res', 'xml', 'expenzo_file_paths.xml');

mkdirSync(javaDir, { recursive: true });
mkdirSync(dirname(filePathsPath), { recursive: true });

writeFileSync(
  exportPluginPath,
  `package ${appPackage};

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.graphics.pdf.PdfDocument;
import android.net.Uri;

import androidx.core.content.FileProvider;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(name = "ExpenzoExport")
public class ExpenzoExportPlugin extends Plugin {
  private static final int PAGE_WIDTH = 595;
  private static final int PAGE_HEIGHT = 842;
  private static final int PAGE_MARGIN = 36;
  private static final int TABLE_PADDING = 6;
  private static final int TABLE_LINE_HEIGHT = 11;
  private static final int TABLE_MIN_ROW_HEIGHT = 24;

  @PluginMethod
  public void exportText(PluginCall call) {
    String filename = call.getString("filename");
    String content = call.getString("content");
    String mimeType = call.getString("mimeType", "text/plain");
    String title = call.getString("title", "Export");

    if (filename == null || filename.trim().isEmpty()) {
      call.reject("A filename is required.");
      return;
    }
    if (content == null) {
      call.reject("Export content is required.");
      return;
    }

    try {
      File exportDir = new File(getContext().getCacheDir(), "exports");
      if (!exportDir.exists() && !exportDir.mkdirs()) {
        call.reject("Unable to prepare export folder.");
        return;
      }

      File outputFile = new File(exportDir, sanitizeFileName(filename));
      try (OutputStreamWriter writer = new OutputStreamWriter(
        new FileOutputStream(outputFile, false),
        StandardCharsets.UTF_8
      )) {
        writer.write(content);
      }

      shareFile(outputFile, mimeType, title);
      call.resolve();
    } catch (ActivityNotFoundException ex) {
      call.reject("No app can handle this export.");
    } catch (Exception ex) {
      call.reject("Unable to export file.");
    }
  }

  @PluginMethod
  public void exportPdf(PluginCall call) {
    String filename = call.getString("filename");
    String content = call.getString("content");
    String title = call.getString("title", "Export Report");

    if (filename == null || filename.trim().isEmpty()) {
      call.reject("A filename is required.");
      return;
    }
    if (content == null || content.trim().isEmpty()) {
      call.reject("Report content is required.");
      return;
    }

    try {
      File exportDir = new File(getContext().getCacheDir(), "exports");
      if (!exportDir.exists() && !exportDir.mkdirs()) {
        call.reject("Unable to prepare export folder.");
        return;
      }

      String outputName = sanitizeFileName(filename);
      if (!outputName.toLowerCase().endsWith(".pdf")) {
        outputName = outputName + ".pdf";
      }

      File outputFile = new File(exportDir, outputName);
      writePdf(outputFile, title, content);
      shareFile(outputFile, "application/pdf", title);
      call.resolve();
    } catch (ActivityNotFoundException ex) {
      call.reject("No app can handle this PDF.");
    } catch (Exception ex) {
      call.reject("Unable to export PDF.");
    }
  }

  private void writePdf(File outputFile, String title, String content) throws Exception {
    JSONObject report = new JSONObject(content);
    PdfDocument document = new PdfDocument();
    Paint titlePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    titlePaint.setColor(Color.rgb(46, 125, 50));
    titlePaint.setTextSize(18);
    titlePaint.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));

    Paint headingPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    headingPaint.setColor(Color.rgb(34, 34, 34));
    headingPaint.setTextSize(14);
    headingPaint.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));

    Paint summaryPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    summaryPaint.setColor(Color.rgb(34, 34, 34));
    summaryPaint.setTextSize(11);

    Paint headerPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    headerPaint.setColor(Color.rgb(34, 34, 34));
    headerPaint.setTextSize(9);
    headerPaint.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));

    Paint cellPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    cellPaint.setColor(Color.rgb(34, 34, 34));
    cellPaint.setTextSize(8.5f);

    Paint borderPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    borderPaint.setColor(Color.rgb(221, 221, 221));
    borderPaint.setStyle(Paint.Style.STROKE);
    borderPaint.setStrokeWidth(1);

    Paint headerBackgroundPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    headerBackgroundPaint.setColor(Color.rgb(245, 245, 245));
    headerBackgroundPaint.setStyle(Paint.Style.FILL);

    PageState state = startPage(document, 1);
    state.canvas.drawText(report.optString("title", title), PAGE_MARGIN, state.y, titlePaint);
    state.y += 28;

    drawSummary(document, state, report.optJSONArray("summary"), headingPaint, summaryPaint);
    state.y += 8;

    drawSectionTitle(document, state, "Category Breakdown", headingPaint);
    drawTable(
      document,
      state,
      new String[] { "Category", "Spent", "Budget" },
      new String[] { "category", "spent", "budget" },
      new float[] { 245, 139, 139 },
      report.optJSONArray("categories"),
      headerPaint,
      cellPaint,
      borderPaint,
      headerBackgroundPaint
    );

    state.y += 14;
    drawSectionTitle(document, state, "Transactions", headingPaint);
    drawTable(
      document,
      state,
      new String[] { "Date", "Name", "Category", "Amount" },
      new String[] { "date", "name", "category", "amount" },
      new float[] { 68, 210, 125, 120 },
      report.optJSONArray("transactions"),
      headerPaint,
      cellPaint,
      borderPaint,
      headerBackgroundPaint
    );

    document.finishPage(state.page);
    try (FileOutputStream output = new FileOutputStream(outputFile, false)) {
      document.writeTo(output);
    } finally {
      document.close();
    }
  }

  private PageState startPage(PdfDocument document, int pageNumber) {
    PdfDocument.PageInfo pageInfo = new PdfDocument.PageInfo.Builder(
      PAGE_WIDTH,
      PAGE_HEIGHT,
      pageNumber
    ).create();
    PageState state = new PageState();
    state.page = document.startPage(pageInfo);
    state.canvas = state.page.getCanvas();
    state.pageNumber = pageNumber;
    state.y = PAGE_MARGIN;
    return state;
  }

  private void startNextPage(PdfDocument document, PageState state) {
    document.finishPage(state.page);
    PageState next = startPage(document, state.pageNumber + 1);
    state.page = next.page;
    state.canvas = next.canvas;
    state.pageNumber = next.pageNumber;
    state.y = next.y;
  }

  private void ensureSpace(PdfDocument document, PageState state, int height) {
    if (state.y + height > PAGE_HEIGHT - PAGE_MARGIN) {
      startNextPage(document, state);
    }
  }

  private void drawSummary(
    PdfDocument document,
    PageState state,
    JSONArray summary,
    Paint headingPaint,
    Paint summaryPaint
  ) {
    ensureSpace(document, state, 48);
    state.canvas.drawText("Summary", PAGE_MARGIN, state.y, headingPaint);
    state.y += 20;

    if (summary == null || summary.length() == 0) {
      return;
    }

    int x = PAGE_MARGIN;
    for (int index = 0; index < summary.length(); index++) {
      JSONObject item = summary.optJSONObject(index);
      if (item == null) continue;
      String text = item.optString("label") + ": " + item.optString("value");
      state.canvas.drawText(text, x, state.y, summaryPaint);
      x += Math.round(summaryPaint.measureText(text)) + 24;
      if (x > PAGE_WIDTH - PAGE_MARGIN - 120) {
        x = PAGE_MARGIN;
        state.y += 16;
      }
    }
    state.y += 18;
  }

  private void drawSectionTitle(
    PdfDocument document,
    PageState state,
    String title,
    Paint headingPaint
  ) {
    ensureSpace(document, state, 42);
    state.canvas.drawText(title, PAGE_MARGIN, state.y, headingPaint);
    state.y += 14;
  }

  private void drawTable(
    PdfDocument document,
    PageState state,
    String[] headers,
    String[] keys,
    float[] widths,
    JSONArray rows,
    Paint headerPaint,
    Paint cellPaint,
    Paint borderPaint,
    Paint headerBackgroundPaint
  ) {
    drawRow(state, headers, widths, headerPaint, borderPaint, headerBackgroundPaint);

    if (rows == null || rows.length() == 0) {
      return;
    }

    for (int rowIndex = 0; rowIndex < rows.length(); rowIndex++) {
      JSONObject row = rows.optJSONObject(rowIndex);
      String[] cells = new String[keys.length];
      for (int cellIndex = 0; cellIndex < keys.length; cellIndex++) {
        cells[cellIndex] = row == null ? "" : row.optString(keys[cellIndex], "");
      }

      int rowHeight = measureRowHeight(cells, widths, cellPaint);
      if (state.y + rowHeight > PAGE_HEIGHT - PAGE_MARGIN) {
        startNextPage(document, state);
        drawRow(state, headers, widths, headerPaint, borderPaint, headerBackgroundPaint);
      }

      drawRow(state, cells, widths, cellPaint, borderPaint, null);
    }
  }

  private int measureRowHeight(String[] cells, float[] widths, Paint paint) {
    int maxLines = 1;
    for (int index = 0; index < cells.length; index++) {
      List<String> lines = wrapText(cells[index], paint, widths[index] - (TABLE_PADDING * 2));
      maxLines = Math.max(maxLines, lines.size());
    }
    return Math.max(TABLE_MIN_ROW_HEIGHT, (maxLines * TABLE_LINE_HEIGHT) + (TABLE_PADDING * 2));
  }

  private void drawRow(
    PageState state,
    String[] cells,
    float[] widths,
    Paint textPaint,
    Paint borderPaint,
    Paint backgroundPaint
  ) {
    int rowHeight = measureRowHeight(cells, widths, textPaint);
    float x = PAGE_MARGIN;
    int top = state.y;

    for (int index = 0; index < cells.length; index++) {
      float right = x + widths[index];
      if (backgroundPaint != null) {
        state.canvas.drawRect(x, top, right, top + rowHeight, backgroundPaint);
      }
      state.canvas.drawRect(x, top, right, top + rowHeight, borderPaint);

      List<String> lines = wrapText(cells[index], textPaint, widths[index] - (TABLE_PADDING * 2));
      float baseline = top + TABLE_PADDING - textPaint.ascent();
      for (String line : lines) {
        state.canvas.drawText(line, x + TABLE_PADDING, baseline, textPaint);
        baseline += TABLE_LINE_HEIGHT;
      }
      x = right;
    }

    state.y += rowHeight;
  }

  private List<String> wrapText(String text, Paint paint, float maxWidth) {
    List<String> lines = new ArrayList<>();
    String safeText = text == null ? "" : text.trim();
    if (safeText.isEmpty()) {
      lines.add("");
      return lines;
    }

    StringBuilder current = new StringBuilder();
    for (String word : safeText.split("\\\\s+")) {
      String next = current.length() == 0 ? word : current + " " + word;
      if (paint.measureText(next) <= maxWidth) {
        current.setLength(0);
        current.append(next);
        continue;
      }

      if (current.length() > 0) {
        lines.add(current.toString());
        current.setLength(0);
      }

      if (paint.measureText(word) <= maxWidth) {
        current.append(word);
      } else {
        lines.addAll(breakLongWord(word, paint, maxWidth));
      }
    }

    if (current.length() > 0) {
      lines.add(current.toString());
    }
    return lines;
  }

  private List<String> breakLongWord(String word, Paint paint, float maxWidth) {
    List<String> parts = new ArrayList<>();
    StringBuilder current = new StringBuilder();
    for (int index = 0; index < word.length(); index++) {
      String next = current.toString() + word.charAt(index);
      if (paint.measureText(next) > maxWidth && current.length() > 0) {
        parts.add(current.toString());
        current.setLength(0);
      }
      current.append(word.charAt(index));
    }
    if (current.length() > 0) {
      parts.add(current.toString());
    }
    return parts;
  }

  private static class PageState {
    PdfDocument.Page page;
    Canvas canvas;
    int pageNumber;
    int y;
  }

  private void shareFile(File file, String mimeType, String title) {
    Uri uri = FileProvider.getUriForFile(
      getContext(),
      getContext().getPackageName() + ".fileprovider",
      file
    );

    Intent shareIntent = new Intent(Intent.ACTION_SEND);
    shareIntent.setType(mimeType);
    shareIntent.putExtra(Intent.EXTRA_STREAM, uri);
    shareIntent.putExtra(Intent.EXTRA_TITLE, title);
    shareIntent.putExtra(Intent.EXTRA_SUBJECT, title);
    shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

    getActivity().startActivity(Intent.createChooser(shareIntent, title));
  }

  private String sanitizeFileName(String filename) {
    String cleaned = filename.trim().replaceAll("[^a-zA-Z0-9._-]", "_");
    return cleaned.isEmpty() ? "expenzo-export.txt" : cleaned;
  }
}
`,
);

writeFileSync(
  filePathsPath,
  `<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <cache-path name="exports" path="exports/" />
</paths>
`,
);

writeFileSync(
  mainActivityPath,
  `package ${appPackage};

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(ExpenzoExportPlugin.class);
    super.onCreate(savedInstanceState);
  }
}
`,
);

let manifest = readFileSync(manifestPath, 'utf8');
if (!/android:name="androidx\.core\.content\.FileProvider"/.test(manifest)) {
  manifest = manifest.replace(
    /<\/application>/,
    `        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/expenzo_file_paths" />
        </provider>
    </application>`,
  );
}

writeFileSync(manifestPath, manifest);

console.log('Android export plugin patched.');
