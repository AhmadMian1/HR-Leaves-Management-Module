import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    @if (loading.loading()) {
      <div class="loading-overlay">
        <mat-spinner diameter="60"></mat-spinner>
      </div>
    }
  `
})
export class LoadingSpinnerComponent {
  constructor(public loading: LoadingService) {}
}
