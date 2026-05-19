import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { ChecklistGroup, ChecklistItem } from '../models/checklist.model';
import { environment } from '../../environments/environment';

interface GVizCell {
  v: number | string | boolean | null;
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
export class ChecklistService {
  private readonly http = inject(HttpClient);

  private readonly url = `https://docs.google.com/spreadsheets/d/${environment.googleSheetId}/gviz/tq?gid=${environment.checklistSheetGid}`;

  /** Column pairs [snoCol, nameCol] for each of the 3 checklist tables */
  private readonly tableColumns: [number, number][] = [
    [0, 1], // A, B
    [3, 4], // D, E
    [6, 7], // G, H
  ];

  getChecklists(): Observable<ChecklistGroup[]> {
    return this.http.get(this.url, { responseType: 'text' }).pipe(
      map((raw) => this.parseGVizResponse(raw)),
      map((data) => this.transformRows(data.table.rows)),
    );
  }

  private parseGVizResponse(raw: string): GVizResponse {
    const jsonStr = raw.replace(/[\s\S]*?setResponse\(/, '').replace(/\);\s*$/, '');
    return JSON.parse(jsonStr);
  }

  private transformRows(rows: GVizRow[]): ChecklistGroup[] {
    // First 2 rows are title + header; data starts from row index 2
    const dataRows = rows.slice(2);

    return this.tableColumns.map(([snoCol, nameCol], index) => {
      const items: ChecklistItem[] = [];

      for (const row of dataRows) {
        const cells = row.c;
        const snoCell = cells[snoCol];

        if (!snoCell || typeof snoCell.v !== 'number') continue;

        items.push({
          sno: snoCell.v,
          name: (cells[nameCol]?.v as string) ?? '',
        });
      }

      return {
        title: `Checklist ${index + 1}`,
        items,
      };
    });
  }
}
