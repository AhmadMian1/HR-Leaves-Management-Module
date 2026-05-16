import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { LeaveBalanceService } from '../../services/leave-balance.service';
import { EmployeeService } from '../../services/employee.service';
import { LeaveBalance } from '../../shared/models/leave-balance.model';
import { Employee } from '../../shared/models/employee.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-leave-balance',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatSelectModule, MatFormFieldModule,
    MatButtonModule, MatIconModule, MatProgressBarModule,
    MatTableModule, MatTooltipModule, MatChipsModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Leave Balances</h1>
        <button mat-raised-button color="accent" (click)="recalculateAll()">
          <mat-icon>refresh</mat-icon> Recalculate Accrued
        </button>
      </div>

      <!-- Employee Filter -->
      <mat-card style="margin-bottom:24px">
        <mat-card-content style="padding:16px;display:flex;gap:16px;align-items:center;flex-wrap:wrap">
          <mat-form-field appearance="outline" style="min-width:260px">
            <mat-label>Filter by Employee</mat-label>
            <mat-select [(ngModel)]="selectedEmployeeId" (ngModelChange)="onEmployeeChange()">
              <mat-option [value]="null">All Employees</mat-option>
              @for (emp of employees; track emp.id) {
                <mat-option [value]="emp.id">{{ emp.fullName }} — {{ emp.department }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          @if (selectedEmployeeId) {
            <button mat-stroked-button (click)="recalculateEmployee()">
              <mat-icon>sync</mat-icon> Recalculate This Employee
            </button>
          }
        </mat-card-content>
      </mat-card>

      <!-- Balance Cards View (when employee selected) -->
      @if (selectedEmployeeId && balances.length > 0) {
        <div class="summary-cards" style="margin-bottom:24px">
          @for (bal of balances; track bal.id) {
            <mat-card class="balance-card">
              <mat-card-header>
                <mat-card-title style="font-size:1rem">{{ bal.leaveTypeName }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="balance-big">
                  <span class="balance-number" [class.low]="bal.remainingDays < 2">
                    {{ bal.remainingDays | number:'1.1-1' }}
                  </span>
                  <span class="balance-unit">days remaining</span>
                </div>
                <div class="balance-progress">
                  <div class="balance-labels">
                    <span>Used: {{ bal.usedDays | number:'1.1-1' }}</span>
                    <span>Total: {{ bal.totalDays | number:'1.1-1' }}</span>
                  </div>
                  <mat-progress-bar
                    [value]="bal.totalDays > 0 ? (bal.usedDays / bal.totalDays) * 100 : 0"
                    [color]="bal.remainingDays < 2 ? 'warn' : 'primary'">
                  </mat-progress-bar>
                </div>
                @if (bal.remainingDays < 2) {
                  <mat-chip color="warn" style="margin-top:8px;font-size:11px">Low Balance</mat-chip>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      }

      <!-- All Balances Table -->
      <div class="table-container">
        <table mat-table [dataSource]="dataSource">

          <ng-container matColumnDef="employeeName">
            <th mat-header-cell *matHeaderCellDef>Employee</th>
            <td mat-cell *matCellDef="let row"><strong>{{ row.employeeName }}</strong></td>
          </ng-container>

          <ng-container matColumnDef="leaveTypeName">
            <th mat-header-cell *matHeaderCellDef>Leave Type</th>
            <td mat-cell *matCellDef="let row">{{ row.leaveTypeName }}</td>
          </ng-container>

          <ng-container matColumnDef="totalDays">
            <th mat-header-cell *matHeaderCellDef>Total</th>
            <td mat-cell *matCellDef="let row">{{ row.totalDays | number:'1.1-1' }}</td>
          </ng-container>

          <ng-container matColumnDef="usedDays">
            <th mat-header-cell *matHeaderCellDef>Used</th>
            <td mat-cell *matCellDef="let row">{{ row.usedDays | number:'1.1-1' }}</td>
          </ng-container>

          <ng-container matColumnDef="remainingDays">
            <th mat-header-cell *matHeaderCellDef>Remaining</th>
            <td mat-cell *matCellDef="let row">
              <strong [class.text-warn]="row.remainingDays < 2">
                {{ row.remainingDays | number:'1.1-1' }}
              </strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="progress">
            <th mat-header-cell *matHeaderCellDef>Usage</th>
            <td mat-cell *matCellDef="let row" style="min-width:120px">
              <mat-progress-bar
                [value]="row.totalDays > 0 ? (row.usedDays / row.totalDays) * 100 : 0"
                [color]="row.remainingDays < 2 ? 'warn' : 'primary'">
              </mat-progress-bar>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" [attr.colspan]="displayedColumns.length" style="text-align:center;padding:40px">
              No balance records found.
            </td>
          </tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .balance-big {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 12px;
    }
    .balance-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a237e;
      line-height: 1;
      &.low { color: #c62828; }
    }
    .balance-unit { font-size: 0.85rem; color: #666; }
    .text-warn { color: #c62828; }
  `]
})
export class LeaveBalanceComponent implements OnInit {
  displayedColumns = ['employeeName', 'leaveTypeName', 'totalDays', 'usedDays', 'remainingDays', 'progress'];
  dataSource = new MatTableDataSource<LeaveBalance>([]);
  balances: LeaveBalance[] = [];
  employees: Employee[] = [];
  selectedEmployeeId: number | null = null;

  constructor(
    private leaveBalanceService: LeaveBalanceService,
    private employeeService: EmployeeService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.employeeService.getAll().subscribe(emps => this.employees = emps);
    this.loadAllBalances();
  }

  loadAllBalances(): void {
    this.leaveBalanceService.getAll().subscribe(balances => {
      this.dataSource.data = balances;
    });
  }

  onEmployeeChange(): void {
    if (!this.selectedEmployeeId) {
      this.balances = [];
      this.loadAllBalances();
      return;
    }
    this.leaveBalanceService.getByEmployee(this.selectedEmployeeId).subscribe(balances => {
      this.balances = balances;
      this.dataSource.data = balances;
    });
  }

  recalculateEmployee(): void {
    if (!this.selectedEmployeeId) return;
    this.leaveBalanceService.recalculateEmployee(this.selectedEmployeeId).subscribe(() => {
      this.notification.success('Accrued leave recalculated.');
      this.onEmployeeChange();
    });
  }

  recalculateAll(): void {
    this.leaveBalanceService.recalculateAll().subscribe(() => {
      this.notification.success('Accrued leave recalculated for all employees.');
      this.onEmployeeChange();
    });
  }
}
