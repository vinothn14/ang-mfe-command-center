import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AnalyticsStoreService } from './analytics-store.service';
import { EventBusService } from '@mfe/shared/event-bus';

describe('AnalyticsStoreService', () => {
  let store: AnalyticsStoreService;
  let eventBus: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnalyticsStoreService, EventBusService],
    });
    store = TestBed.inject(AnalyticsStoreService);
    eventBus = TestBed.inject(EventBusService);
  });

  it('should initialize with baseline sprint throughput and status metrics', () => {
    expect(store.throughput().length).toBeGreaterThan(0);
    expect(store.totalTasks()).toBeGreaterThan(0);
    expect(store.completionRate()).toBeGreaterThan(0);
  });

  it('should update todo count and add activity when task:created is dispatched', () => {
    const initialTodo = store.statusCounts().todo;
    const initialActivities = store.activities().length;

    eventBus.dispatch('task:created', {
      id: 'TSK-999',
      title: 'E2E Metric Test',
      description: 'Test payload',
      status: 'todo',
      priority: 'high',
      assignee: { name: 'Alex Rivera', avatarUrl: '' },
      tags: ['Test'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(store.statusCounts().todo).toBe(initialTodo + 1);
    expect(store.activities().length).toBe(initialActivities + 1);
  });

  it('should transition status counts and increment sprint throughput when task is moved to done', () => {
    const initialDone = store.statusCounts().done;
    const initialThroughput = store.throughput()[store.throughput().length - 1].completed;

    eventBus.dispatch('task:status-changed', {
      taskId: 'TSK-102',
      oldStatus: 'in_progress',
      newStatus: 'done',
      timestamp: Date.now(),
    });

    expect(store.statusCounts().done).toBe(initialDone + 1);
    const updatedThroughput = store.throughput()[store.throughput().length - 1].completed;
    expect(updatedThroughput).toBe(initialThroughput + 1);
  });

  it('should replay tasks created before AnalyticsStoreService was instantiated', () => {
    const freshBus = new EventBusService();
    freshBus.dispatch('task:created', {
      id: 'TSK-888',
      title: 'Created Before Analytics Opened',
      description: 'Replay test',
      status: 'todo',
      priority: 'critical',
      assignee: { name: 'Alex Rivera', avatarUrl: '' },
      tags: ['Replay'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    freshBus.dispatch('task:status-changed', {
      taskId: 'TSK-888',
      oldStatus: 'todo',
      newStatus: 'done',
      timestamp: Date.now(),
    });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [AnalyticsStoreService, { provide: EventBusService, useValue: freshBus }],
    });

    const lateStore = TestBed.inject(AnalyticsStoreService);
    expect(lateStore.statusCounts().done).toBe(23);
    expect(
      lateStore.activities().some(a => a.description.includes('Created Before Analytics Opened')),
    ).toBe(true);
  });
});
