import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ExpenseResponse } from '../models/expense.model';
import { apiCycleStart } from '../utils/cycle-start';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly http = inject(HttpClient);

  getExpenses(cycleStartDay?: number): Observable<ExpenseResponse> {
    let params = new HttpParams().set('token', environment.token);
    const day = cycleStartDay ?? environment.defaultCycleStartDay;
    params = params.set('cycleStartDay', apiCycleStart(day).toString());

    return this.http.get<ExpenseResponse>(environment.apiUrl, { params });
  }
}
