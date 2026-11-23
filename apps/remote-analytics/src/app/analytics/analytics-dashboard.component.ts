import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsStoreService } from './analytics-store.service';

@Component({
  selector: 'mfe-analytics-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss'],
})
export class AnalyticsDashboardComponent {
  readonly store = inject(AnalyticsStoreService);

  calculateBarHeight(completed: number, max: number): number {
    return Math.round((completed / max) * 140);
  }
}
