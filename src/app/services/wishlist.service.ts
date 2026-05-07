import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { WishlistItem } from '../models/wishlist.model';
import { environment } from '../../environments/environment';

interface GVizCell {
  v: number | string | null;
  f?: string;
}

interface GVizRow {
  c: (GVizCell | null)[];
}

interface GVizResponse {
  table: {
    rows: GVizRow[];
  };
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly http = inject(HttpClient);

  private readonly url = `https://docs.google.com/spreadsheets/d/${environment.googleSheetId}/gviz/tq?gid=${environment.wishlistSheetGid}`;

  getWishlist(): Observable<WishlistItem[]> {
    return this.http.get(this.url, { responseType: 'text' }).pipe(
      map((raw) => this.parseGVizResponse(raw)),
      map((data) => this.transformRows(data.table.rows)),
    );
  }

  private parseGVizResponse(raw: string): GVizResponse {
    // Strip JSONP wrapper: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
    // Use [\s\S]*? to match across newlines before setResponse(
    const jsonStr = raw.replace(/[\s\S]*?setResponse\(/, '').replace(/\);\s*$/, '');
    return JSON.parse(jsonStr);
  }

  private transformRows(rows: GVizRow[]): WishlistItem[] {
    const items: WishlistItem[] = [];

    for (const row of rows) {
      const cells = row.c;
      const snoCell = cells[0];

      // Only consider rows where S No is present
      if (!snoCell || snoCell.v == null) continue;

      const sno = Number(snoCell.v);
      const name = (cells[1]?.v as string) ?? '';
      const quantityCell = cells[2];
      // Use formatted value (handles fractions like "1/2"), fall back to raw numeric, or null
      const quantity: string | null =
        quantityCell?.f ?? (quantityCell?.v != null ? String(quantityCell.v) : null);
      const unit = (cells[3]?.v as string) ?? '';
      const comment = (cells[4]?.v as string) || null;

      items.push({ sno, name, quantity, unit, comment });
    }

    return items;
  }
}
