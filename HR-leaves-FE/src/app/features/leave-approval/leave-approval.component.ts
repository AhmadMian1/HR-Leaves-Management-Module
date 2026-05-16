import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectionModel } from '@angular/cdk/collections';
import { LeaveRequestService } from '../../services/leave-request.service';
import { LeaveRequest } from '../../shared/models/leave-request.model';
import { PagedResponse } from '../../shared/models/common.model';
import { NotificationService } from '../../core/services/notification.service';
import {
  ConfirmationDialogComponent,
  ConfirmDialogData
} from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-leave-approval',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatCheckboxModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Leave Approval</h1>
        <div class="bulk-actions" *ngIf="selection.hasValue()">
          <span class="selection-count">{{ selection.selected.length }} selected</span>
          <button mat-raised-button color="primary" (click)="bulkApprove()">
            <mat-icon>check_circle</mat-icon> Bulk Approve
          </button>
          <button mat-raised-button color="warn" (click)="bulkReject()">
            <mat-icon>cancel</mat-icon> Bulk Reject
          </button>
        </div>
      </div>

      <div class="filter-bar">
        <mat-form-field appearance="outline">
          <mat-label>Status Filter</mat-label>
          <mat-select [formControl]="statusFilter" (selectionChange)="onStatusChange()">
            <mat-option value="Pending">Pending Only</mat-option>
            <mat-option value="">All Statuses</mat-option>
            <mat-option value="Approved">Approved</mat-option>
            <mat-option value="Rejected">Rejected</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="table-container">
        <table mat-table [dataSource]="dataSource">

          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef>
              <mat-checkbox
                (change)="$event ? masterToggle() : null"
                [checked]="selection.hasValue() && isAllSelected()"
                [indeterminate]="selection.hasValue() && !isAllSelected()">
              </mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row">
              <mat-checkbox
                (click)="$event.stopPropagation()"
                (change)="$event ? selection.toggle(row) : null"
                [checked]="selection.isSelected(row)"
                [disabled]="row.status !== 'Pending'">
              </mat-checkbox>
            </td>
          </ng-container>

          <ng-container matColumnDef="employeeName">
            <th mat-header-cell *matHeaderCellDef>Employee</th>
            <td mat-cell *matCellDef="let row"><strong>{{ row.employeeName }}</strong></td>
          </ng-container>

          <ng-container matColumnDef="leaveTypeName">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let row">{{ row.leaveTypeName }}</td>
          </ng-container>

          <ng-container matColumnDef="dates">
            <th mat-header-cell *matHeaderCellDef>Dates</th>
            <td mat-cell *matCellDef="let row">
              {{ row.startDate | date:'MMM d' }} – {{ row.endDate | date:'MMM d, yyyy' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="daysRequested">
            <th mat-header-cell *matHeaderCellDef>Days</th>
            <td mat-cell *matCellDef="let row">{{ row.daysRequested }}</td>
          </ng-container>

          <ng-container matColumnDef="reason">
            <th mat-header-cell *matHeaderCellDef>Reason</th>
            <td mat-cell *matCellDef="let row">
              <span [matTooltip]="row.reason" class="truncate">{{ row.reason | slice:0:60 }}{{ row.reason.length > 60 ? '...' : '' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let row">
              <span class="status-chip" [class]="row.status.toLowerCase()">{{ row.status }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let row">
              @if (row.status === 'Pending') {
                <button mat-icon-button color="primary" (click)="approve(row)"
                        matTooltip="Approve">
                  <mat-icon>check_circle</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="reject(row)"
                        matTooltip="Reject">
                  <mat-icon>cancel</mat-icon>
                </button>
              }
              @if (row.status === 'Approved') {
                <button mat-icon-button color="warn" (click)="cancel(row)"
                        matTooltip="Cancel">
                  <mat-icon>block</mat-icon>
                </button>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" [attr.colspan]="displayedColumns.length" style="text-align:center;padding:40px">
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
    .bulk-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .selection-count {
      font-size: 14px;
      color: #1a237e;
      font-weight: 500;
    }
    .truncate { max-width: 200px; overflow: hidden; white-space: nowrap; display: inline-block; }
  `]
})
export class LeaveApprovalComponent implements OnInit {
  displayedColumns = ['select', 'employeeName', 'leaveTypeName', 'dates', 'daysRequested', 'reason', 'status', 'actions'];
  dataSource = new MatTableDataSource<LeaveRequest>([]);
  selection = new SelectionModel<LeaveRequest>(true, []);
  totalCount = 0;
  pageSize = 10;
  pageNumber = 1;
  statusFilter = new FormControl('Pending');

  constructor(
    private leaveRequestService: LeaveRequestService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void { this.loadRequests(); }

  loadRequests(): void {
    this.leaveRequestService.getPaged({
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      status: this.statusFilter.value || undefined
    }).subscribe(response => {
      this.dataSource.data = response.data;
      this.totalCount = response.totalCount;
      this.selection.clear();
    });
  }

  onStatusChange(): void {
    this.pageNumber = 1;
    this.loadRequests();
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadRequests();
  }

  isAllSelected(): boolean {
    const selectableRows = this.dataSource.data.filter(r => r.status === 'Pending');
    return this.selection.selected.length === selectableRows.length;
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.filter(r => r.status === 'Pending').forEach(r => this.selection.select(r));
    }
  }

  approve(request: LeaveRequest): void {
    this.openConfirm({
      title: 'Approve Request',
      message: `Approve leave request for ${request.employeeName} (${request.daysRequested} days)?`,
      confirmLabel: 'Approve',
      color: 'primary'
    }).then(confirmed => {
      if (!confirmed) return;
      this.leaveRequestService.approve(request.id).subscribe(() => {
        this.notification.success('Leave request approved.');
        this.loadRequests();
      });
    });
  }

  reject(request: LeaveRequest): void {
    this.openConfirm({
      title: 'Reject Request',
      message: `Reject leave request for ${request.employeeName}?`,
      confirmLabel: 'Reject',
      color: 'warn'
    }).then(confirmed => {
      if (!confirmed) return;
      this.leaveRequestService.reject(request.id, { rejectionComment: 'Rejected by manager' }).subscribe(() => {
        this.notification.success('Leave request rejected.');
        this.loadRequests();
      });
    });
  }

  cancel(request: LeaveRequest): void {
    this.openConfirm({
      title: 'Cancel Request',
      message: `Cancel the approved leave for ${request.employeeName}? Balance will be restored.`,
      confirmLabel: 'Cancel Leave',
      color: 'warn'
    }).then(confirmed => {
      if (!confirmed) return;
      this.leaveRequestService.cancel(request.id).subscribe(() => {
        this.notification.success('Leave request cancelled and balance restored.');
        this.loadRequests();
      });
    });
  }

  bulkApprove(): void {
    const ids = this.selection.selected.map(r => r.id);
    this.openConfirm({
      title: 'Bulk Approve',
      message: `Approve ${ids.length} selected leave request(s)?`,
      confirmLabel: 'Approve All',
      color: 'primary'
    }).then(confirmed => {
      if (!confirmed) return;
      this.leaveRequestService.bulkApprove({ leaveRequestIds: ids }).subscribe(results => {
        this.notification.success(`${results.length} request(s) approved.`);
        this.loadRequests();
      });
    });
  }

  bulkReject(): void {
    const ids = this.selection.selected.map(r => r.id);
    this.openConfirm({
      title: 'Bulk Reject',
      message: `Reject ${ids.length} selected leave request(s)?`,
      confirmLabel: 'Reject All',
      color: 'warn'
    }).then(confirmed => {
      if (!confirmed) return;
      this.leaveRequestService.bulkReject({ leaveRequestIds: ids }).subscribe(results => {
        this.notification.success(`${results.length} request(s) rejected.`);
        this.loadRequests();
      });
    });
  }

  private openConfirm(data: ConfirmDialogData): Promise<boolean> {
    return this.dialog.open(ConfirmationDialogComponent, { data, width: '400px' })
      .afterClosed().toPromise().then(r => !!r);
  }
}
