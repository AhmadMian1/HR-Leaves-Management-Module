import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LeaveType, CreateLeaveType, UpdateLeaveType } from '../shared/models/leave-type.model';
import { ApiResponse } from '../shared/models/common.model';

@Injectable({ providedIn: 'root' })
export class LeaveTypeService {
  private readonly url = `${environment.apiUrl}/leavetypes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<LeaveType[]> {
    return this.http.get<ApiResponse<LeaveType[]>>(this.url).pipe(map(r => r.data));
  }

  getById(id: number): Observable<LeaveType> {
    return this.http.get<ApiResponse<LeaveType>>(`${this.url}/${id}`).pipe(map(r => r.data));
  }

  create(dto: CreateLeaveType): Observable<LeaveType> {
    return this.http.post<ApiResponse<LeaveType>>(this.url, dto).pipe(map(r => r.data));
  }

  update(id: number, dto: UpdateLeaveType): Observable<LeaveType> {
    return this.http.put<ApiResponse<LeaveType>>(`${this.url}/${id}`, dto).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`).pipe(map(() => void 0));
  }
}
