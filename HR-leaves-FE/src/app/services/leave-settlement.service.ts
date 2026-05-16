import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LeaveSettlement, CreateLeaveSettlement } from '../shared/models/leave-settlement.model';
import { ApiResponse, PagedResponse } from '../shared/models/common.model';

@Injectable({ providedIn: 'root' })
export class LeaveSettlementService {
  private readonly url = `${environment.apiUrl}/leavesettlements`;

  constructor(private http: HttpClient) {}

  getPaged(pageNumber = 1, pageSize = 10, employeeId?: number, leaveTypeId?: number): Observable<PagedResponse<LeaveSettlement>> {
    let httpParams = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (employeeId) httpParams = httpParams.set('employeeId', employeeId);
    if (leaveTypeId) httpParams = httpParams.set('leaveTypeId', leaveTypeId);

    return this.http.get<ApiResponse<PagedResponse<LeaveSettlement>>>(this.url, { params: httpParams })
      .pipe(map(r => r.data));
  }

  getByEmployee(employeeId: number): Observable<LeaveSettlement[]> {
    return this.http.get<ApiResponse<LeaveSettlement[]>>(`${this.url}/employee/${employeeId}`)
      .pipe(map(r => r.data));
  }

  getById(id: number): Observable<LeaveSettlement> {
    return this.http.get<ApiResponse<LeaveSettlement>>(`${this.url}/${id}`).pipe(map(r => r.data));
  }

  create(dto: CreateLeaveSettlement): Observable<LeaveSettlement> {
    return this.http.post<ApiResponse<LeaveSettlement>>(this.url, dto).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`).pipe(map(() => void 0));
  }
}
