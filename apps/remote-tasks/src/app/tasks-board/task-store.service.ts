import { Injectable, computed, inject, signal } from '@angular/core';
import { TaskItem, TaskPriority, TaskStatus } from '@mfe/shared/contracts';
import { EventBusService } from '@mfe/shared/event-bus';

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'TSK-101',
    title: 'Architect Native Federation runtime manifest',
    description:
      'Configure dynamic manifest loader and esbuild module resolution across micro-apps.',
    status: 'done',
    priority: 'critical',
    assignee: {
      name: 'Alex Rivera',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexMFE',
    },
    tags: ['Architecture', 'Federation', 'esbuild'],
    createdAt: '2026-11-20T09:00:00Z',
    updatedAt: '2026-11-23T10:00:00Z',
  },
  {
    id: 'TSK-102',
    title: 'Implement Angular Signals Kanban board',
    description: 'Build reactive board state with computed columns and optimistic updates.',
    status: 'in_progress',
    priority: 'high',
    assignee: {
      name: 'Elena Rostova',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ElenaDev',
    },
    tags: ['Signals', 'Kanban', 'UI'],
    createdAt: '2026-11-21T11:30:00Z',
    updatedAt: '2026-11-23T11:00:00Z',
  },
  {
    id: 'TSK-103',
    title: 'Implement Shell graceful fallback and retry UI',
    description:
      'Ensure host handles offline remotes with diagnostic cards and non-blocking retry loops.',
    status: 'done',
    priority: 'high',
    assignee: {
      name: 'Marcus Chen',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=MarcusOps',
    },
    tags: ['Resilience', 'Host', 'Shell'],
    createdAt: '2026-11-21T14:15:00Z',
    updatedAt: '2026-11-23T12:00:00Z',
  },
  {
    id: 'TSK-104',
    title: 'Setup GitHub Actions CI with Nx affected',
    description:
      'Establish automated matrix running lint, vitest, and build only on touched apps/libs.',
    status: 'todo',
    priority: 'medium',
    assignee: {
      name: 'Alex Rivera',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexMFE',
    },
    tags: ['CI/CD', 'Nx', 'Actions'],
    createdAt: '2026-11-22T08:00:00Z',
    updatedAt: '2026-11-22T08:00:00Z',
  },
  {
    id: 'TSK-105',
    title: 'Phase 2: Add Analytics remote with mock charting',
    description: 'Scaffold secondary remote MFE consuming real-time task event stream.',
    status: 'todo',
    priority: 'low',
    assignee: {
      name: 'Elena Rostova',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ElenaDev',
    },
    tags: ['Phase2', 'Analytics', 'Charts'],
    createdAt: '2026-11-23T09:00:00Z',
    updatedAt: '2026-11-23T09:00:00Z',
  },
];

const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];

@Injectable({
  providedIn: 'root',
})
export class TaskStoreService {
  private readonly eventBus = inject(EventBusService);

  // Core State Signals
  readonly tasks = signal<TaskItem[]>(INITIAL_TASKS);
  readonly selectedPriority = signal<TaskPriority | 'all'>('all');
  readonly searchQuery = signal<string>('');

  // Computed Derived State
  readonly filteredTasks = computed(() => {
    const list = this.tasks();
    const priority = this.selectedPriority();
    const query = this.searchQuery().toLowerCase().trim();

    return list.filter(task => {
      const matchesPriority = priority === 'all' || task.priority === priority;
      const matchesQuery =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.tags.some(t => t.toLowerCase().includes(query));
      return matchesPriority && matchesQuery;
    });
  });

  readonly todo = computed(() => this.filteredTasks().filter(t => t.status === 'todo'));
  readonly inProgress = computed(() =>
    this.filteredTasks().filter(t => t.status === 'in_progress'),
  );
  readonly review = computed(() => this.filteredTasks().filter(t => t.status === 'review'));
  readonly done = computed(() => this.filteredTasks().filter(t => t.status === 'done'));

  readonly metrics = computed(() => {
    const all = this.tasks();
    const total = all.length;
    const completed = all.filter(t => t.status === 'done').length;
    const active = all.filter(t => t.status === 'in_progress' || t.status === 'review').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, active, rate };
  });

  moveTask(taskId: string, direction: 'forward' | 'backward'): void {
    const task = this.tasks().find(t => t.id === taskId);
    if (!task) return;

    const currentIndex = STATUS_ORDER.indexOf(task.status);
    const nextIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex < 0 || nextIndex >= STATUS_ORDER.length) return;

    const oldStatus = task.status;
    const newStatus = STATUS_ORDER[nextIndex];

    this.tasks.update(list =>
      list.map(t =>
        t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t,
      ),
    );

    // Broadcast across event bus
    this.eventBus.dispatch('task:status-changed', {
      taskId,
      oldStatus,
      newStatus,
      timestamp: Date.now(),
    });
  }

  addTask(input: {
    title: string;
    description: string;
    priority: TaskPriority;
    tags: string[];
    assigneeName?: string;
  }): TaskItem {
    const nextId = `TSK-${Math.floor(100 + Math.random() * 900)}`;
    const newTask: TaskItem = {
      id: nextId,
      title: input.title,
      description: input.description,
      status: 'todo',
      priority: input.priority,
      assignee: {
        name: input.assigneeName || 'Alex Rivera',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${input.assigneeName || 'NewMFE'}`,
      },
      tags: input.tags.length ? input.tags : ['Feature'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tasks.update(list => [newTask, ...list]);
    this.eventBus.dispatch('task:created', newTask);
    return newTask;
  }

  deleteTask(taskId: string): void {
    this.tasks.update(list => list.filter(t => t.id !== taskId));
    this.eventBus.dispatch('task:deleted', {
      taskId,
      timestamp: Date.now(),
    });
  }

  setPriorityFilter(priority: TaskPriority | 'all'): void {
    this.selectedPriority.set(priority);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }
}
