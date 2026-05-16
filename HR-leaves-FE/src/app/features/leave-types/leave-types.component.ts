import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LeaveTypeService } from '../../services/leave-type.service';
import { LeaveType } from '../../shared/models/leave-type.model';
import { NotificationService } from '../../core/services/notification.service';
import {
  ConfirmationDialogComponent
} from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-leave-types',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSlideToggleModule, MatChipsModule, MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Leave Types Management</h1>
        <button mat-raised-button color="primary" (click)="openForm()">
          <mat-icon>add</mat-icon> Add Leave Type
        </button>
      </div>

      <!-- Form Panel -->
      @if (showForm) {
        <mat-card class="form-card" style="margin-bottom:24px">
          <mat-card-header>
            <mat-card-title>{{ editingId ? 'Edit' : 'New' }} Leave Type</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Name</mat-label>
                  <input matInput formControlName="name" placeholder="e.g. Vacation, Sick Leave">
                  <mat-error>Name is required (max 100 chars)</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Default Days</mat-label>
                  <input matInput type="number" formControlName="defaultDays" min="0">
                  <mat-error>Must be 0 or more</mat-error>
                </mat-form-field>

                <div class="toggle-field">
                  <mat-slide-toggle formControlName="isAccrued" (change)="onAccruedChange()">
                    Accrued Leave
                  </mat-slide-toggle>
                  <small>Enable if leave accrues monthly</small>
                </div>

                @if (form.value.isAccrued) {
                  <mat-form-field appearance="outline">
                    <mat-label>Accrual Rate (days/month)</mat-label>
                    <input matInput type="number" formControlName="accrualRatePerMonth" min="0" step="0.25">
                    <mat-hint>e.g. 1.25 for vacation</mat-hint>
                  </mat-form-field>
                }

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="2"></textarea>
                  <mat-hint>{{ form.value.description?.length || 0 }}/500</mat-hint>
                </mat-form-field>
              </div>

              <div style="display:flex;gap:12px;margin-top:12px">
                <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
                  <mat-icon>save</mat-icon> {{ editingId ? 'Update' : 'Create' }}
                </button>
                <button mat-stroked-button type="button" (click)="cancelForm()">
                  Cancel
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }

      <!-- Table -->
      <div class="table-container">
        <table mat-table [dataSource]="dataSource">

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let row"><strong>{{ row.name }}</strong></td>
          </ng-container>

          <ng-container matColumnDef="defaultDays">
            <th mat-header-cell *matHeaderCellDef>Default Days</th>
            <td mat-cell *matCellDef="let row">{{ row.defaultDays }}</td>
          </ng-container>

          <ng-container matColumnDef="isAccrued">
            <th mat-header-cell *matHeaderCellDef>Accrued</th>
            <td mat-cell *matCellDef="let row">
              @if (row.isAccrued) {
                <mat-chip color="primary" highlighted>Yes ({{ row.accrualRatePerMonth }}/mo)</mat-chip>
              } @else {
                <span style="color:#999">No</span>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let row" class="hide-sm">{{ row.description }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button color="primary" (click)="editLeaveType(row)" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteLeaveType(row)" matTooltip="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell" [attr.colspan]="displayedColumns.length" style="text-align:center;padding:40px">
              No leave types configured yet.
            </td>
          </tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .toggle-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      justify-content: center;
      small { color: #999; font-size: 11px; }
    }
  `]
})
export class LeaveTypesComponent implements OnInit {
  displayedColumns = ['name', 'defaultDays', 'isAccrued', 'description', 'actions'];
  dataSource = new MatTableDataSource<LeaveType>([]);
  form!: FormGroup;
  showForm = false;
  editingId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private leaveTypeService: LeaveTypeService,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadTypes();
  }

  loadTypes(): void {
    this.leaveTypeService.getAll().subscribe(types => this.dataSource.data = types);
  }

  openForm(): void {
    this.editingId = null;
    this.initForm();
    this.showForm = true;
  }

  editLeaveType(lt: LeaveType): void {
    this.editingId = lt.id;
    this.form.patchValue(lt);
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.initForm();
  }

  onAccruedChange(): void {
    if (!this.form.value.isAccrued) this.form.patchValue({ accrualRatePerMonth: 0 });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const dto = this.form.value;
    const obs = this.editingId
      ? this.leaveTypeService.update(this.editingId, dto)
      : this.leaveTypeService.create(dto);

    obs.subscribe(() => {
      this.notification.success(this.editingId ? 'Leave type updated.' : 'Leave type created.');
      this.cancelForm();
      this.loadTypes();
    });
  }

  deleteLeaveType(lt: LeaveType): void {
    this.dialog.open(ConfirmationDialogComponent, {
      data: { title: 'Delete Leave Type', message: `Delete "${lt.name}"? This cannot be undone.`, color: 'warn', confirmLabel: 'Delete' },
      width: '400px'
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.leaveTypeService.delete(lt.id).subscribe(() => {
        this.notification.success('Leave type deleted.');
        this.loadTypes();
      });
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      defaultDays: [0, [Validators.required, Validators.min(0)]],
      isAccrued: [false],
      accrualRatePerMonth: [0, Validators.min(0)],
      description: ['', Validators.maxLength(500)]
    });
  }
}
