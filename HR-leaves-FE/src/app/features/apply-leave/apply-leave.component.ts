import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LeaveRequestService } from '../../services/leave-request.service';
import { LeaveTypeService } from '../../services/leave-type.service';
import { EmployeeService } from '../../services/employee.service';
import { LeaveBalanceService } from '../../services/leave-balance.service';
import { LeaveType } from '../../shared/models/leave-type.model';
import { Employee } from '../../shared/models/employee.model';
import { LeaveBalance } from '../../shared/models/leave-balance.model';
import { NotificationService } from '../../core/services/notification.service';

const DRAFT_KEY = 'leave_request_draft';

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, MatIconModule, MatProgressBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Apply for Leave</h1>
      </div>

      <div class="apply-layout">
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>New Leave Request</mat-card-title>
            <mat-card-subtitle>Fill in the details below to submit your leave request</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Employee</mat-label>
                  <mat-select formControlName="employeeId" (selectionChange)="onEmployeeChange()">
                    @for (emp of employees; track emp.id) {
                      <mat-option [value]="emp.id">{{ emp.fullName }} — {{ emp.department }}</mat-option>
                    }
                  </mat-select>
                  <mat-error>Employee is required</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Leave Type</mat-label>
                  <mat-select formControlName="leaveTypeId" (selectionChange)="onLeaveTypeChange()">
                    @for (lt of leaveTypes; track lt.id) {
                      <mat-option [value]="lt.id">{{ lt.name }}</mat-option>
                    }
                  </mat-select>
                  <mat-error>Leave type is required</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Start Date</mat-label>
                  <input matInput [matDatepicker]="startPicker" formControlName="startDate"
                         [min]="minDate" (dateChange)="onDateChange()">
                  <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                  <mat-datepicker #startPicker></mat-datepicker>
                  <mat-error>Start date is required</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>End Date</mat-label>
                  <input matInput [matDatepicker]="endPicker" formControlName="endDate"
                         [min]="form.value.startDate || minDate" (dateChange)="onDateChange()">
                  <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                  <mat-datepicker #endPicker></mat-datepicker>
                  <mat-error>End date must be on or after start date</mat-error>
                </mat-form-field>
              </div>

              <!-- Days Calculation -->
              @if (calculatedDays > 0) {
                <div class="days-badge">
                  <mat-icon>event</mat-icon>
                  <strong>{{ calculatedDays }}</strong> working day(s) requested
                </div>
              }

              <!-- Low Balance Warning -->
              @if (showLowBalanceWarning) {
                <div class="low-balance-warning">
                  <mat-icon>warning</mat-icon>
                  Low balance! You have {{ currentBalance?.remainingDays | number:'1.1-1' }} days remaining.
                  @if (calculatedDays > (currentBalance?.remainingDays ?? 0)) {
                    <strong> Insufficient balance.</strong>
                  }
                </div>
              }

              <!-- Balance Info -->
              @if (currentBalance) {
                <div class="balance-info">
                  <span>Balance: {{ currentBalance.remainingDays | number:'1.1-1' }} / {{ currentBalance.totalDays | number:'1.1-1' }} days remaining</span>
                  <mat-progress-bar
                    [value]="(currentBalance.usedDays / currentBalance.totalDays) * 100"
                    [color]="balanceColor">
                  </mat-progress-bar>
                </div>
              }

              <mat-form-field appearance="outline" class="full-width" style="margin-top:16px">
                <mat-label>Reason</mat-label>
                <textarea matInput formControlName="reason" rows="4"
                  placeholder="Please provide a brief reason for your leave request..."></textarea>
                <mat-hint>{{ form.value.reason?.length || 0 }}/1000</mat-hint>
                <mat-error>Reason is required (max 1000 characters)</mat-error>
              </mat-form-field>

              <div class="form-actions">
                <button mat-stroked-button type="button" (click)="saveDraft()">
                  <mat-icon>save</mat-icon> Save Draft
                </button>
                <button mat-stroked-button type="button" (click)="clearDraft()">
                  <mat-icon>delete_outline</mat-icon> Clear
                </button>
                <button mat-raised-button color="primary" type="submit"
                        [disabled]="form.invalid || isSubmitting">
                  <mat-icon>send</mat-icon>
                  {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- All Balances -->
        @if (allBalances.length > 0) {
          <mat-card class="balances-card">
            <mat-card-header>
              <mat-card-title>Your Leave Balances</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @for (bal of allBalances; track bal.id) {
                <div class="balance-item">
                  <div class="balance-header">
                    <span class="balance-name">{{ bal.leaveTypeName }}</span>
                    <span class="balance-days">{{ bal.remainingDays | number:'1.1-1' }} days left</span>
                  </div>
                  <mat-progress-bar
                    [value]="bal.totalDays > 0 ? (bal.remainingDays / bal.totalDays) * 100 : 0"
                    [color]="bal.remainingDays < 2 ? 'warn' : 'primary'">
                  </mat-progress-bar>
                  <div class="balance-sub">{{ bal.usedDays | number:'1.1-1' }} used / {{ bal.totalDays | number:'1.1-1' }} total</div>
                </div>
              }
            </mat-card-content>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .apply-layout {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .form-card { }
    .balances-card { align-self: start; }

    .days-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #e3f2fd;
      color: #1565c0;
      padding: 10px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 0.95rem;
    }

    .balance-info {
      margin-bottom: 8px;
      span { font-size: 12px; color: #666; display: block; margin-bottom: 4px; }
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    .balance-item {
      margin-bottom: 20px;
    }
    .balance-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .balance-name { font-weight: 500; }
    .balance-days { color: #1a237e; font-weight: 600; }
    .balance-sub { font-size: 11px; color: #999; margin-top: 4px; }
  `]
})
export class ApplyLeaveComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  leaveTypes: LeaveType[] = [];
  employees: Employee[] = [];
  allBalances: LeaveBalance[] = [];
  currentBalance: LeaveBalance | null = null;
  calculatedDays = 0;
  isSubmitting = false;
  showLowBalanceWarning = false;
  minDate = new Date();
  balanceColor: 'primary' | 'warn' = 'primary';
  private subs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private leaveRequestService: LeaveRequestService,
    private leaveTypeService: LeaveTypeService,
    private employeeService: EmployeeService,
    private leaveBalanceService: LeaveBalanceService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      employeeId: [null, Validators.required],
      leaveTypeId: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      reason: ['', [Validators.required, Validators.maxLength(1000)]]
    });

    this.leaveTypeService.getAll().subscribe(types => this.leaveTypes = types);
    this.employeeService.getAll().subscribe(emps => this.employees = emps);

    this.loadDraft();

    // Auto-save draft on form changes
    this.subs.add(
      this.form.valueChanges.pipe(debounceTime(1000))
        .subscribe(() => this.saveDraft())
    );
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  onEmployeeChange(): void {
    const employeeId = this.form.value.employeeId;
    if (!employeeId) return;
    this.leaveBalanceService.getByEmployee(employeeId).subscribe(balances => {
      this.allBalances = balances;
      this.updateCurrentBalance();
    });
  }

  onLeaveTypeChange(): void { this.updateCurrentBalance(); }

  onDateChange(): void {
    const { startDate, endDate } = this.form.value;
    if (startDate && endDate && startDate <= endDate) {
      this.calculatedDays = this.calculateBusinessDays(new Date(startDate), new Date(endDate));
      this.checkBalanceWarning();
    } else {
      this.calculatedDays = 0;
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const { startDate, endDate, ...rest } = this.form.value;

    this.leaveRequestService.create({
      ...rest,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString()
    }).subscribe({
      next: () => {
        this.notification.success('Leave request submitted successfully!');
        this.clearDraft();
        this.form.reset();
        this.calculatedDays = 0;
        this.currentBalance = null;
        this.allBalances = [];
        this.isSubmitting = false;
      },
      error: () => { this.isSubmitting = false; }
    });
  }

  saveDraft(): void {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(this.form.value));
    this.notification.info('Draft saved.');
  }

  clearDraft(): void {
    localStorage.removeItem(DRAFT_KEY);
    this.form.reset();
    this.calculatedDays = 0;
  }

  private loadDraft(): void {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const values = JSON.parse(draft);
        this.form.patchValue(values);
        if (values.employeeId) this.onEmployeeChange();
        this.onDateChange();
      } catch { localStorage.removeItem(DRAFT_KEY); }
    }
  }

  private updateCurrentBalance(): void {
    const { employeeId, leaveTypeId } = this.form.value;
    if (employeeId && leaveTypeId) {
      this.currentBalance = this.allBalances.find(b => b.leaveTypeId === leaveTypeId) ?? null;
      this.checkBalanceWarning();
    }
  }

  private checkBalanceWarning(): void {
    if (!this.currentBalance) return;
    const remaining = this.currentBalance.remainingDays;
    this.showLowBalanceWarning = remaining < 3 || this.calculatedDays > remaining;
    this.balanceColor = remaining < 2 ? 'warn' : 'primary';
  }

  private calculateBusinessDays(start: Date, end: Date): number {
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      if (cur.getDay() !== 0 && cur.getDay() !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }
}
