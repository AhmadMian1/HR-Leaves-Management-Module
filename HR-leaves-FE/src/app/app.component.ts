import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, LoadingSpinnerComponent
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav mode="side" opened class="sidenav" fixedInViewport>
        <div class="brand">
          <mat-icon class="brand-icon">business</mat-icon>
          <span class="brand-text">HR Leaves</span>
        </div>
        <mat-nav-list>
          @for (item of navItems; track item.route) {
            <a mat-list-item [routerLink]="item.route" routerLinkActive="active-nav-item">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-title">HR Leave Management System</span>
        </mat-toolbar>

        <main class="main-content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>

    <app-loading-spinner />
  `,
  styles: [`
    .sidenav-container { height: 100vh; }

    .sidenav {
      width: 240px;
      background: linear-gradient(180deg, #1a4d6d 0%, #0d2d42 100%);
      color: white;
      box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 16px;
      background: linear-gradient(135deg, #0d2d42 0%, #153a52 100%);
      margin-bottom: 16px;
      border-bottom: 2px solid rgba(0, 188, 212, 0.2);
    }

    .brand-icon { color: #00d4d4; font-size: 32px; width: 32px; height: 32px; }
    .brand-text { font-size: 1.3rem; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; }

    .sidenav .mat-mdc-list-item {
      color: rgba(255, 255, 255, 0.85);
      border-radius: 0 24px 24px 0;
      margin-right: 12px;
      margin-bottom: 6px;
      transition: all 0.3s ease;
    }

    .sidenav .mat-mdc-list-item:hover {
      background: rgba(0, 212, 212, 0.15);
      color: #00d4d4;
      padding-left: 8px;
    }

    ::ng-deep .active-nav-item {
      background: linear-gradient(90deg, rgba(0, 188, 212, 0.25) 0%, rgba(0, 212, 212, 0.1) 100%) !important;
      color: #00d4d4 !important;
      border-left: 4px solid #00d4d4;
      padding-left: 4px !important;
    }

    mat-toolbar {
      background: linear-gradient(90deg, #00897b 0%, #00b8b8 100%) !important;
      box-shadow: 0 2px 8px rgba(0, 137, 123, 0.15);
      color: white;
    }

    .toolbar-title { margin-left: 8px; font-size: 1.1rem; font-weight: 500; }

    .main-content { padding: 0; }
  `]
})
export class AppComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Apply Leave', icon: 'add_circle', route: '/apply-leave' },
    { label: 'Leave Approval', icon: 'check_circle', route: '/leave-approval' },
    { label: 'Leave Types', icon: 'category', route: '/leave-types' },
    { label: 'Leave Balance', icon: 'account_balance_wallet', route: '/leave-balance' }
  ];
}
