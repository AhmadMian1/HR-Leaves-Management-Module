import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    title: 'Dashboard'
  },
  {
    path: 'apply-leave',
    loadComponent: () => import('./features/apply-leave/apply-leave.component')
      .then(m => m.ApplyLeaveComponent),
    title: 'Apply Leave'
  },
  {
    path: 'leave-approval',
    loadComponent: () => import('./features/leave-approval/leave-approval.component')
      .then(m => m.LeaveApprovalComponent),
    title: 'Leave Approval'
  },
  {
    path: 'leave-types',
    loadComponent: () => import('./features/leave-types/leave-types.component')
      .then(m => m.LeaveTypesComponent),
    title: 'Leave Types'
  },
  {
    path: 'leave-balance',
    loadComponent: () => import('./features/leave-balance/leave-balance.component')
      .then(m => m.LeaveBalanceComponent),
    title: 'Leave Balance'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
