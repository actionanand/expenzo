import { Injectable } from '@angular/core';

interface AndroidExportOptions {
  filename: string;
  content: string;
  mimeType: string;
  title: string;
}

interface AndroidExportPlugin {
  exportText(options: AndroidExportOptions): Promise<void>;
  exportPdf(options: Omit<AndroidExportOptions, 'mimeType'>): Promise<void>;
}

interface CapacitorBridge {
  getPlatform?: () => string;
  isNativePlatform?: () => boolean;
  Plugins?: {
    ExpenzoExport?: AndroidExportPlugin;
  };
}

export interface CsvExportOptions {
  readonly filename: string;
  readonly content: string;
  readonly title: string;
}

export interface PdfExportOptions {
  readonly filename: string;
  readonly androidPayload: string;
  readonly fallbackHtml: string;
  readonly title: string;
}

declare global {
  interface Window {
    Capacitor?: CapacitorBridge;
  }
}

@Injectable({ providedIn: 'root' })
export class FileExportService {
  exportCsv(options: CsvExportOptions): Promise<string> {
    const content = '\uFEFF' + options.content;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });

    if (this.isAndroid()) {
      const plugin = window.Capacitor?.Plugins?.ExpenzoExport;
      if (plugin) {
        return plugin
          .exportText({
            filename: options.filename,
            content,
            mimeType: 'text/csv',
            title: options.title,
          })
          .then(() => 'Choose an app to save or share');
      }
    }

    return this.tryShareFile(blob, options.filename, options.title)
      .then((shared) => {
        if (shared) {
          return 'Share completed';
        }
        this.triggerDownload(blob, options.filename);
        return 'CSV downloaded';
      })
      .catch(() =>
        navigator.clipboard.writeText(options.content).then(
          () => 'CSV copied to clipboard',
          () => Promise.reject(new Error('CSV export failed')),
        ),
      );
  }

  exportPdf(options: PdfExportOptions): Promise<string> {
    if (this.isAndroid()) {
      const plugin = window.Capacitor?.Plugins?.ExpenzoExport;
      if (plugin) {
        return plugin
          .exportPdf({
            filename: options.filename,
            content: options.androidPayload,
            title: options.title,
          })
          .then(() => 'Choose an app to save or share');
      }
    }

    const htmlFilename = options.filename.replace(/\.pdf$/i, '.html');
    const blob = new Blob([options.fallbackHtml], { type: 'text/html;charset=utf-8' });
    return this.tryShareFile(blob, htmlFilename, options.title).then((shared) => {
      if (shared) {
        return 'Share completed';
      }
      this.printViaIframe(options.fallbackHtml);
      return 'Print dialog opened';
    });
  }

  private isAndroid(): boolean {
    const capacitor = window.Capacitor;
    return capacitor?.isNativePlatform?.() === true && capacitor.getPlatform?.() === 'android';
  }

  private tryShareFile(blob: Blob, filename: string, title: string): Promise<boolean> {
    if (typeof navigator.share !== 'function') {
      return Promise.resolve(false);
    }

    const file = new File([blob], filename, { type: blob.type });
    if (typeof navigator.canShare === 'function') {
      try {
        if (!navigator.canShare({ files: [file] })) {
          return Promise.resolve(false);
        }
      } catch {
        return Promise.resolve(false);
      }
    }

    return navigator.share({ files: [file], title }).then(
      () => true,
      (error: unknown) =>
        error instanceof DOMException && error.name === 'AbortError' ? true : false,
    );
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    window.setTimeout(() => {
      anchor.remove();
      URL.revokeObjectURL(url);
    }, 300);
  }

  private printViaIframe(html: string): void {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-9999px;width:0;height:0;border:none';
    document.body.appendChild(iframe);

    const documentRef = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!documentRef) {
      iframe.remove();
      throw new Error('Unable to prepare PDF');
    }

    documentRef.open();
    documentRef.write(html);
    documentRef.close();

    window.setTimeout(() => {
      iframe.contentWindow?.print();
      const cleanup = () => iframe.remove();
      iframe.contentWindow?.addEventListener('afterprint', cleanup, { once: true });
      window.setTimeout(cleanup, 10_000);
    }, 400);
  }
}
