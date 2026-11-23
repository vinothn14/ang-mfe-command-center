import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TaskStoreService } from './task-store.service';
import { EventBusService } from '@mfe/shared/event-bus';

describe('TaskStoreService (Signals State Management)', () => {
  let store: TaskStoreService;
  let eventBus: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskStoreService, EventBusService],
    });
    store = TestBed.inject(TaskStoreService);
    eventBus = TestBed.inject(EventBusService);
  });

  it('should initialize with default tasks and compute status column signals', () => {
    expect(store.tasks().length).toBeGreaterThan(0);
    expect(store.todo().length).toBeGreaterThan(0);
    expect(store.metrics().total).toBe(store.tasks().length);
  });

  it('should move a task forward from todo to in_progress and update signals', () => {
    const todoTask = store.todo()[0];
    const initialTodoCount = store.todo().length;
    const initialInProgressCount = store.inProgress().length;

    store.moveTask(todoTask.id, 'forward');

    expect(store.todo().length).toBe(initialTodoCount - 1);
    expect(store.inProgress().length).toBe(initialInProgressCount + 1);

    const moved = store.tasks().find(t => t.id === todoTask.id);
    expect(moved?.status).toBe('in_progress');
  });

  it('should add a new task and compute updated metrics', () => {
    const initialTotal = store.tasks().length;

    const newTask = store.addTask({
      title: 'Unit Test Task',
      description: 'Testing Signals state store',
      priority: 'high',
      tags: ['Test'],
    });

    expect(store.tasks().length).toBe(initialTotal + 1);
    expect(newTask.status).toBe('todo');
    expect(store.todo().some(t => t.id === newTask.id)).toBe(true);
  });

  it('should delete a task from state', () => {
    const taskToDelete = store.tasks()[0];
    const initialTotal = store.tasks().length;

    store.deleteTask(taskToDelete.id);

    expect(store.tasks().length).toBe(initialTotal - 1);
    expect(store.tasks().some(t => t.id === taskToDelete.id)).toBe(false);
  });

  it('should filter tasks by priority signal', () => {
    store.setPriorityFilter('critical');
    const filtered = store.filteredTasks();
    expect(filtered.every(t => t.priority === 'critical')).toBe(true);
  });
});
