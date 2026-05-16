import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LeaveBalance } from '../shared/models/leave-balance.model';
import { ApiResponse } from '../shared/models/common.model';

@Injectable({ providedIn: 'root' })
export class LeaveBalanceService {
  private readonly url = `${environment.apiUrl}/leavebalances`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<LeaveBalance[]> {
    return this.http.get<ApiResponse<LeaveBalance[]>>(this.url).pipe(map(r => r.data));
  }

  getByEmployee(employeeId: number): Observable<LeaveBalance[]> {
    return this.http.get<ApiResponse<LeaveBalance[]>>(`${this.url}/employee/${employeeId}`)
      .pipe(map(r => r.data));
  }

  recalculateEmployee(employeeId: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.url}/recalculate/${employeeId}`, {})
      .pipe(map(() => void 0));
  }

  recalculateAll(): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.url}/recalculate-all`, {})
      .pipe(map(() => void 0));
  }
}
