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
import android.net.Uri;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.ParcelFileDescriptor;
import android.print.PageRange;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.core.content.FileProvider;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "ExpenzoExport")
public class ExpenzoExportPlugin extends Plugin {

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
      renderHtmlToPdf(outputFile, title, content, new PdfCallback() {
        @Override
        public void onSuccess() {
          try {
            shareFile(outputFile, "application/pdf", title);
            call.resolve();
          } catch (ActivityNotFoundException ex) {
            call.reject("No app can handle this PDF.");
          } catch (Exception ex) {
            call.reject("Unable to share PDF.");
          }
        }

        @Override
        public void onError(String message) {
          call.reject(message);
        }
      });
    } catch (Exception ex) {
      call.reject("Unable to export PDF.");
    }
  }

  private void renderHtmlToPdf(File outputFile, String title, String html, PdfCallback callback) {
    getActivity().runOnUiThread(() -> {
      WebView webView = new WebView(getContext());
      webView.getSettings().setJavaScriptEnabled(false);
      webView.setWebViewClient(new WebViewClient() {
        private boolean rendered = false;

        @Override
        public void onPageFinished(WebView view, String url) {
          if (rendered) {
            return;
          }
          rendered = true;

          PrintDocumentAdapter adapter = view.createPrintDocumentAdapter(title);
          PrintAttributes attributes = new PrintAttributes.Builder()
            .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
            .setResolution(new PrintAttributes.Resolution("pdf", "pdf", 300, 300))
            .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
            .build();

          ParcelFileDescriptor descriptor;
          try {
            descriptor = ParcelFileDescriptor.open(
              outputFile,
              ParcelFileDescriptor.MODE_CREATE
                | ParcelFileDescriptor.MODE_TRUNCATE
                | ParcelFileDescriptor.MODE_READ_WRITE
            );
          } catch (Exception ex) {
            destroyWebView(view);
            callback.onError("Unable to create PDF file.");
            return;
          }

          adapter.onLayout(
            null,
            attributes,
            new CancellationSignal(),
            new PrintDocumentAdapter.LayoutResultCallback() {
              @Override
              public void onLayoutFinished(android.print.PrintDocumentInfo info, boolean changed) {
                adapter.onWrite(
                  new PageRange[] { PageRange.ALL_PAGES },
                  descriptor,
                  new CancellationSignal(),
                  new PrintDocumentAdapter.WriteResultCallback() {
                    @Override
                    public void onWriteFinished(PageRange[] pages) {
                      closeQuietly(descriptor);
                      destroyWebView(view);
                      callback.onSuccess();
                    }

                    @Override
                    public void onWriteFailed(CharSequence error) {
                      closeQuietly(descriptor);
                      destroyWebView(view);
                      callback.onError("Unable to write PDF.");
                    }

                    @Override
                    public void onWriteCancelled() {
                      closeQuietly(descriptor);
                      destroyWebView(view);
                      callback.onError("PDF export was cancelled.");
                    }
                  }
                );
              }

              @Override
              public void onLayoutFailed(CharSequence error) {
                closeQuietly(descriptor);
                destroyWebView(view);
                callback.onError("Unable to lay out PDF.");
              }

              @Override
              public void onLayoutCancelled() {
                closeQuietly(descriptor);
                destroyWebView(view);
                callback.onError("PDF export was cancelled.");
              }
            },
            new Bundle()
          );
        }
      });
      webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
    });
  }

  private void closeQuietly(ParcelFileDescriptor descriptor) {
    try {
      descriptor.close();
    } catch (Exception ignored) {
      // Already closed.
    }
  }

  private void destroyWebView(WebView webView) {
    try {
      webView.destroy();
    } catch (Exception ignored) {
      // WebView cleanup is best-effort after PDF generation.
    }
  }

  private interface PdfCallback {
    void onSuccess();
    void onError(String message);
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
