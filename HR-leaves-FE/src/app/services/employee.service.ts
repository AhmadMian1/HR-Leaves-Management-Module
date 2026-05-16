import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Employee, CreateEmployee, UpdateEmployee } from '../shared/models/employee.model';
import { ApiResponse, PagedResponse, QueryParameters } from '../shared/models/common.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly url = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getPaged(params: QueryParameters): Observable<PagedResponse<Employee>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber ?? 1)
      .set('pageSize', params.pageSize ?? 10);

    if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDescending !== undefined) httpParams = httpParams.set('sortDescending', params.sortDescending);

    return this.http.get<ApiResponse<PagedResponse<Employee>>>(this.url, { params: httpParams })
      .pipe(map(r => r.data));
  }

  getAll(): Observable<Employee[]> {
    return this.http.get<ApiResponse<Employee[]>>(`${this.url}/list`)
      .pipe(map(r => r.data));
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<ApiResponse<Employee>>(`${this.url}/${id}`)
      .pipe(map(r => r.data));
  }

  create(dto: CreateEmployee): Observable<Employee> {
    return this.http.post<ApiResponse<Employee>>(this.url, dto)
      .pipe(map(r => r.data));
  }

  update(id: number, dto: UpdateEmployee): Observable<Employee> {
    return this.http.put<ApiResponse<Employee>>(`${this.url}/${id}`, dto)
      .pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`)
      .pipe(map(() => void 0));
  }
}
