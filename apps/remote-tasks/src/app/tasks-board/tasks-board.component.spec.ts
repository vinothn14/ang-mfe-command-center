import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TasksBoardComponent } from './tasks-board.component';
import { TaskStoreService } from './task-store.service';
import { EventBusService } from '@mfe/shared/event-bus';

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
});
