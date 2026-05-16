import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { LeaveRequestService } from '../../services/leave-request.service';
import { LeaveTypeService } from '../../services/leave-type.service';
import { LeaveRequest } from '../../shared/models/leave-request.model';
import { LeaveType } from '../../shared/models/leave-type.model';
import { LeaveRequestQueryParameters, PagedResponse } from '../../shared/models/common.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatChipsModule, MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Dashboard</h1>
        <button mat-raised-button color="primary" (click)="exportCsv()">
          <mat-icon>download</mat-icon> Export CSV
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        @for (stat of summaryStats; track stat.label) {
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon" [style.background]="stat.color">
                <mat-icon>{{ stat.icon }}</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="filters.status" (ngModelChange)="onFilterChange()">
            <mat-option value="">All</mat-option>
            <mat-option value="Pending">Pending</mat-option>
            <mat-option value="Approved">Approved</mat-option>
            <mat-option value="Rejected">Rejected</mat-option>
            <mat-option value="Cancelled">Cancelled</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Leave Type</mat-label>
          <mat-select [(ngModel)]="filters.leaveTypeId" (ngModelChange)="onFilterChange()">
            <mat-option [value]="undefined">All Types</mat-option>
            @for (lt of leaveTypes; track lt.id) {
              <mat-option [value]="lt.id">{{ lt.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>From Date</mat-label>
          <input matInput [matDatepicker]="fromPicker" [(ngModel)]="fromDate"
                 (ngModelChange)="onDateChange()">
          <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
          <mat-datepicker #fromPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>To Date</mat-label>
          <input matInput [matDatepicker]="toPicker" [(ngModel)]="toDate"
                 (ngModelChange)="onDateChange()">
          <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
          <mat-datepicker #toPicker></mat-datepicker>
        </mat-form-field>

        <button mat-stroked-button (click)="clearFilters()">
          <mat-icon>clear</mat-icon> Clear
        </button>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table mat-table [dataSource]="dataSource" matSort (matSortChange)="onSortChange($event)">

          <ng-container matColumnDef="employeeName">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Employee</th>
            <td mat-cell *matCellDef="let row">{{ row.employeeName }}</td>
          </ng-container>

          <ng-container matColumnDef="leaveTypeName">
            <th mat-header-cell *matHeaderCellDef>Leave Type</th>
            <td mat-cell *matCellDef="let row">{{ row.leaveTypeName }}</td>
          </ng-container>

          <ng-container matColumnDef="startDate">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Start Date</th>
            <td mat-cell *matCellDef="let row">{{ row.startDate | date:'mediumDate' }}</td>
          </ng-container>

          <ng-container matColumnDef="endDate">
            <th mat-header-cell *matHeaderCellDef>End Date</th>
            <td mat-cell *matCellDef="let row">{{ row.endDate | date:'mediumDate' }}</td>
          </ng-container>

          <ng-container matColumnDef="daysRequested">
            <th mat-header-cell *matHeaderCellDef>Days</th>
            <td mat-cell *matCellDef="let row">{{ row.daysRequested }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let row">
              <span class="status-chip" [class]="row.status.toLowerCase()">
                {{ row.status }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Submitted</th>
            <td mat-cell *matCellDef="let row" class="hide-sm">{{ row.createdAt | date:'shortDate' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
              No leave requests found.
            </td>
          </tr>
        </table>

        <mat-paginator
          [length]="totalCount"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 25, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }
    .stat-icon {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon { color: white; font-size: 28px; width: 28px; height: 28px; }
    }
    .stat-value { font-size: 1.8rem; font-weight: 700; line-height: 1; }
    .stat-label { font-size: 0.85rem; color: #666; margin-top: 4px; }
    .no-data { text-align: center; padding: 40px; color: #999; }
  `]
})
export class DashboardComponent implements OnInit {
  displayedColumns = ['employeeName', 'leaveTypeName', 'startDate', 'endDate', 'daysRequested', 'status', 'createdAt'];
  dataSource = new MatTableDataSource<LeaveRequest>([]);
  leaveTypes: LeaveType[] = [];
  totalCount = 0;
  pageSize = 10;
  pageNumber = 1;
  sortBy = '';
  sortDescending = false;
  fromDate: Date | null = null;
  toDate: Date | null = null;

  filters: { status?: string; leaveTypeId?: number } = {};

  summaryStats = [
    { label: 'Total Requests', value: 0, icon: 'description', color: '#1a237e' },
    { label: 'Pending', value: 0, icon: 'schedule', color: '#f57c00' },
    { label: 'Approved', value: 0, icon: 'check_circle', color: '#2e7d32' },
    { label: 'Rejected', value: 0, icon: 'cancel', color: '#c62828' }
  ];

  private filterSubject = new Subject<void>();

  constructor(
    private leaveRequestService: LeaveRequestService,
    private leaveTypeService: LeaveTypeService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.leaveTypeService.getAll().subscribe(types => this.leaveTypes = types);
    this.loadRequests();

    this.filterSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(() => {
        this.pageNumber = 1;
        return this.leaveRequestService.getPaged(this.buildParams());
      })
    ).subscribe(response => this.handleResponse(response));
  }

  loadRequests(): void {
    this.leaveRequestService.getPaged(this.buildParams()).subscribe(response => {
      this.handleResponse(response);
      this.updateSummary(response);
    });
  }

  private handleResponse(response: PagedResponse<LeaveRequest>): void {
    this.dataSource.data = response.data;
    this.totalCount = response.totalCount;
  }

  private updateSummary(response: PagedResponse<LeaveRequest>): void {
    this.summaryStats[0].value = response.totalCount;
    this.summaryStats[1].value = response.data.filter(r => r.status === 'Pending').length;
    this.summaryStats[2].value = response.data.filter(r => r.status === 'Approved').length;
    this.summaryStats[3].value = response.data.filter(r => r.status === 'Rejected').length;
  }

  private buildParams(): LeaveRequestQueryParameters {
    return {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      status: this.filters.status || undefined,
      leaveTypeId: this.filters.leaveTypeId,
      startDateFrom: this.fromDate ? this.fromDate.toISOString() : undefined,
      startDateTo: this.toDate ? this.toDate.toISOString() : undefined,
      sortBy: this.sortBy || undefined,
      sortDescending: this.sortDescending
    };
  }

  onFilterChange(): void { this.filterSubject.next(); }
  onDateChange(): void { this.filterSubject.next(); }

  onSortChange(sort: { active: string; direction: string }): void {
    this.sortBy = sort.active;
    this.sortDescending = sort.direction === 'desc';
    this.loadRequests();
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadRequests();
  }

  clearFilters(): void {
    this.filters = {};
    this.fromDate = null;
    this.toDate = null;
    this.loadRequests();
  }

  exportCsv(): void {
    this.leaveRequestService.exportCsv(this.buildParams()).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leave-requests-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.notification.success('CSV exported successfully.');
      }
    });
  }
}
