import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AnalyticsDashboardComponent } from './analytics-dashboard.component';
import { AnalyticsStoreService } from './analytics-store.service';
import { EventBusService } from '@mfe/shared/event-bus';

describe('AnalyticsDashboardComponent', () => {
  let component: AnalyticsDashboardComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AnalyticsDashboardComponent],
      providers: [AnalyticsStoreService, EventBusService],
    });
    const fixture = TestBed.createComponent(AnalyticsDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should instantiate and compute SVG bar height proportionally', () => {
    expect(component).toBeTruthy();
    const barHeight = component.calculateBarHeight(50, 100);
    expect(barHeight).toBe(70); // (50/100) * 140 = 70
  });
});
