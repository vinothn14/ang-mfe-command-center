import { Routes } from '@angular/router';
import { AnalyticsDashboardComponent } from '../analytics/analytics-dashboard.component';

export const ANALYTICS_ROUTES: Routes = [
  {
    path: '',
    component: AnalyticsDashboardComponent,
  },
];

export default ANALYTICS_ROUTES;
