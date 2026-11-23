import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsDashboardComponent } from './analytics/analytics-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AnalyticsDashboardComponent],
  template: `
    <main class="standalone-container">
      <mfe-analytics-dashboard />
    </main>
  `,
  styles: [
    `
      .standalone-container {
        min-height: 100vh;
        background-color: var(--color-bg-canvas);
        color: var(--color-text-primary);
      }
    `,
  ],
})
export class AppComponent {}
