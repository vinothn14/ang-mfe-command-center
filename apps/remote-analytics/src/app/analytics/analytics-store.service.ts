import { Injectable, computed, inject, signal, OnDestroy } from '@angular/core';
import { EventBusService } from '@mfe/shared/event-bus';
import { TaskStatus } from '@mfe/shared/contracts';
import { Subscription } from 'rxjs';

export interface WeeklyThroughput {
  week: string;
  completed: number;
}

export interface AnalyticsActivity {
  id: string;
  description: string;
  timestamp: string;
  type: 'created' | 'status-change' | 'deleted';
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsStoreService implements OnDestroy {
  private readonly eventBus = inject(EventBusService);
  private readonly sub = new Subscription();

  // Core State Signals
  readonly throughput = signal<WeeklyThroughput[]>([
    { week: 'Sprint 44', completed: 14 },
    { week: 'Sprint 45', completed: 19 },
    { week: 'Sprint 46', completed: 26 },
    { week: 'Sprint 47', completed: 32 },
  ]);

  readonly statusCounts = signal<Record<TaskStatus, number>>({
    todo: 8,
    in_progress: 6,
    review: 4,
    done: 22,
  });

  readonly activities = signal<AnalyticsActivity[]>([
    {
      id: 'act-1',
      description: 'System initialized baseline sprint telemetry',
      timestamp: '10:00:00 AM',
      type: 'created',
    },
    {
      id: 'act-2',
      description: 'Task TSK-101 moved to Completed (Native Federation)',
      timestamp: '10:15:00 AM',
      type: 'status-change',
    },
  ]);

  // Computed Metrics
  readonly totalTasks = computed(() => {
    const s = this.statusCounts();
    return s.todo + s.in_progress + s.review + s.done;
  });

  readonly completionRate = computed(() => {
    const total = this.totalTasks();
    if (total === 0) return 0;
    return Math.round((this.statusCounts().done / total) * 100);
  });

  readonly maxThroughput = computed(() => {
    return Math.max(...this.throughput().map(t => t.completed), 1);
  });

  constructor() {
    this.listenToCrossRemoteEvents();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private listenToCrossRemoteEvents(): void {
    // React to tasks created in remote-tasks
    this.sub.add(
      this.eventBus.on('task:created').subscribe(task => {
        this.statusCounts.update(curr => ({
          ...curr,
          todo: curr.todo + 1,
        }));

        this.addActivity({
          id: `act-${Date.now()}`,
          description: `Task created: "${task.title}" [${task.priority}]`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'created',
        });
      }),
    );

    // React to task status transitions in remote-tasks
    this.sub.add(
      this.eventBus.on('task:status-changed').subscribe(event => {
        this.statusCounts.update(curr => {
          const updated = { ...curr };
          if (updated[event.oldStatus] > 0) {
            updated[event.oldStatus]--;
          }
          updated[event.newStatus]++;
          return updated;
        });

        if (event.newStatus === 'done') {
          this.throughput.update(list => {
            const last = list[list.length - 1];
            return [...list.slice(0, -1), { ...last, completed: last.completed + 1 }];
          });
        }

        this.addActivity({
          id: `act-${Date.now()}`,
          description: `Task ${event.taskId} moved: ${event.oldStatus} ➔ ${event.newStatus}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'status-change',
        });
      }),
    );
  }

  private addActivity(activity: AnalyticsActivity): void {
    this.activities.update(list => [activity, ...list].slice(0, 10));
  }
}
