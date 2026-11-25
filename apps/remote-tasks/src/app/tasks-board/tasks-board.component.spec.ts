import { describe, it, expect, beforeEach } from 'vitest';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TasksBoardComponent } from './tasks-board.component';
import { TaskStoreService } from './task-store.service';
import { EventBusService } from '@mfe/shared/event-bus';
import { AUTH_READER_TOKEN, AuthReader, INITIAL_AUTH_STATE } from '@mfe/shared/contracts';

describe('TasksBoardComponent', () => {
  let component: TasksBoardComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TasksBoardComponent],
      providers: [TaskStoreService, EventBusService],
    });
    const fixture = TestBed.createComponent(TasksBoardComponent);
    component = fixture.componentInstance;
  });

  it('should instantiate and show initial modal closed state', () => {
    expect(component).toBeTruthy();
    expect(component.showAddModal()).toBe(false);
  });

  it('should toggle add task modal', () => {
    component.openModal();
    expect(component.showAddModal()).toBe(true);

    component.closeModal();
    expect(component.showAddModal()).toBe(false);
  });

  it('should block create, delete, and status moves (arrow buttons) for viewer role', () => {
    const viewerAuthReader: AuthReader = {
      authState: signal({
        ...INITIAL_AUTH_STATE,
        user: {
          id: 'usr-viewer',
          name: 'Viewer User',
          email: 'viewer@enterprise-mfe.io',
          role: 'viewer',
        },
      }).asReadonly(),
      currentRole: signal('viewer' as const).asReadonly(),
      isViewer: () => true,
      hasRole: role => role === 'viewer',
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TasksBoardComponent],
      providers: [
        TaskStoreService,
        EventBusService,
        { provide: AUTH_READER_TOKEN, useValue: viewerAuthReader },
      ],
    });

    const fixture = TestBed.createComponent(TasksBoardComponent);
    fixture.detectChanges();
    const viewerComp = fixture.componentInstance;
    const el: HTMLElement = fixture.nativeElement;

    expect(viewerComp.isReadOnly()).toBe(true);

    // Arrow move buttons, delete buttons, and New Task button must not be rendered
    expect(el.querySelectorAll('.nav-btn').length).toBe(0);
    expect(el.querySelectorAll('.delete-btn').length).toBe(0);
    expect(el.querySelectorAll('.btn-add').length).toBe(0);
    expect(el.querySelector('.readonly-badge')).toBeTruthy();

    // Imperative calls must also be blocked
    const todoTask = viewerComp.store.todo()[0];
    const initialStatus = todoTask.status;
    const initialCount = viewerComp.store.tasks().length;

    viewerComp.moveTask(todoTask.id, 'forward');
    viewerComp.deleteTask(todoTask.id);
    viewerComp.openModal();

    expect(viewerComp.store.tasks().find(t => t.id === todoTask.id)?.status).toBe(initialStatus);
    expect(viewerComp.store.tasks().length).toBe(initialCount);
    expect(viewerComp.showAddModal()).toBe(false);
  });
});
