import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  LeaveRequest, CreateLeaveRequest, ApproveRejectRequest,
  BulkApproveRejectRequest
} from '../shared/models/leave-request.model';
import { ApiResponse, PagedResponse, LeaveRequestQueryParameters } from '../shared/models/common.model';

@Injectable({ providedIn: 'root' })
export class LeaveRequestService {
  private readonly url = `${environment.apiUrl}/leaverequests`;

  constructor(private http: HttpClient) {}

  getPaged(params: LeaveRequestQueryParameters): Observable<PagedResponse<LeaveRequest>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber ?? 1)
      .set('pageSize', params.pageSize ?? 10);

    if (params.employeeId) httpParams = httpParams.set('employeeId', params.employeeId);
    if (params.leaveTypeId) httpParams = httpParams.set('leaveTypeId', params.leaveTypeId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.startDateFrom) httpParams = httpParams.set('startDateFrom', params.startDateFrom);
    if (params.startDateTo) httpParams = httpParams.set('startDateTo', params.startDateTo);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDescending !== undefined) httpParams = httpParams.set('sortDescending', params.sortDescending);

    return this.http.get<ApiResponse<PagedResponse<LeaveRequest>>>(this.url, { params: httpParams })
      .pipe(map(r => r.data));
  }

  getById(id: number): Observable<LeaveRequest> {
    return this.http.get<ApiResponse<LeaveRequest>>(`${this.url}/${id}`).pipe(map(r => r.data));
  }

  create(dto: CreateLeaveRequest): Observable<LeaveRequest> {
    return this.http.post<ApiResponse<LeaveRequest>>(this.url, dto).pipe(map(r => r.data));
  }

  approve(id: number): Observable<LeaveRequest> {
    return this.http.patch<ApiResponse<LeaveRequest>>(`${this.url}/${id}/approve`, {})
      .pipe(map(r => r.data));
  }

  reject(id: number, dto: ApproveRejectRequest): Observable<LeaveRequest> {
    return this.http.patch<ApiResponse<LeaveRequest>>(`${this.url}/${id}/reject`, dto)
      .pipe(map(r => r.data));
  }

  cancel(id: number): Observable<LeaveRequest> {
    return this.http.patch<ApiResponse<LeaveRequest>>(`${this.url}/${id}/cancel`, {})
      .pipe(map(r => r.data));
  }

  bulkApprove(dto: BulkApproveRejectRequest): Observable<LeaveRequest[]> {
    return this.http.post<ApiResponse<LeaveRequest[]>>(`${this.url}/bulk-approve`, dto)
      .pipe(map(r => r.data));
  }

  bulkReject(dto: BulkApproveRejectRequest): Observable<LeaveRequest[]> {
    return this.http.post<ApiResponse<LeaveRequest[]>>(`${this.url}/bulk-reject`, dto)
      .pipe(map(r => r.data));
  }

  exportCsv(params: LeaveRequestQueryParameters): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params.employeeId) httpParams = httpParams.set('employeeId', params.employeeId);
    if (params.leaveTypeId) httpParams = httpParams.set('leaveTypeId', params.leaveTypeId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.startDateFrom) httpParams = httpParams.set('startDateFrom', params.startDateFrom);
    if (params.startDateTo) httpParams = httpParams.set('startDateTo', params.startDateTo);

    return this.http.get(`${this.url}/export/csv`, {
      params: httpParams,
      responseType: 'blob'
    });
  }
}
