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

@CapacitorPlugin(name = "ExpenzoExport")
public class ExpenzoExportPlugin extends Plugin {
  private static final int PAGE_WIDTH = 595;
  private static final int PAGE_HEIGHT = 842;
  private static final int PAGE_MARGIN = 36;

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
    PdfDocument document = new PdfDocument();
    Paint titlePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    titlePaint.setColor(Color.rgb(46, 125, 50));
    titlePaint.setTextSize(18);
    titlePaint.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));

    Paint bodyPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    bodyPaint.setColor(Color.rgb(34, 34, 34));
    bodyPaint.setTextSize(10);
    bodyPaint.setTypeface(Typeface.MONOSPACE);

    int pageNumber = 1;
    PdfDocument.Page page = startPage(document, pageNumber);
    Canvas canvas = page.getCanvas();
    int y = PAGE_MARGIN;

    canvas.drawText(title, PAGE_MARGIN, y, titlePaint);
    y += 26;

    for (String rawLine : content.split("\\\\r?\\\\n", -1)) {
      List<String> wrappedLines = wrapLine(rawLine, bodyPaint, PAGE_WIDTH - (PAGE_MARGIN * 2));
      if (wrappedLines.isEmpty()) {
        y += 12;
        if (y > PAGE_HEIGHT - PAGE_MARGIN) {
          document.finishPage(page);
          page = startPage(document, ++pageNumber);
          canvas = page.getCanvas();
          y = PAGE_MARGIN;
        }
        continue;
      }

      for (String line : wrappedLines) {
        if (y > PAGE_HEIGHT - PAGE_MARGIN) {
          document.finishPage(page);
          page = startPage(document, ++pageNumber);
          canvas = page.getCanvas();
          y = PAGE_MARGIN;
        }
        canvas.drawText(line, PAGE_MARGIN, y, bodyPaint);
        y += 14;
      }
    }

    document.finishPage(page);
    try (FileOutputStream output = new FileOutputStream(outputFile, false)) {
      document.writeTo(output);
    } finally {
      document.close();
    }
  }

  private PdfDocument.Page startPage(PdfDocument document, int pageNumber) {
    PdfDocument.PageInfo pageInfo = new PdfDocument.PageInfo.Builder(
      PAGE_WIDTH,
      PAGE_HEIGHT,
      pageNumber
    ).create();
    return document.startPage(pageInfo);
  }

  private List<String> wrapLine(String rawLine, Paint paint, int maxWidth) {
    List<String> lines = new ArrayList<>();
    String line = rawLine == null ? "" : rawLine.trim();
    if (line.isEmpty()) {
      return lines;
    }

    StringBuilder current = new StringBuilder();
    for (String word : line.split("\\\\s+")) {
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

  private List<String> breakLongWord(String word, Paint paint, int maxWidth) {
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
