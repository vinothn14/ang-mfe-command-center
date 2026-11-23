import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskStoreService } from './task-store.service';
import { AUTH_READER_TOKEN, TaskItem, TaskPriority } from '@mfe/shared/contracts';

@Component({
  selector: 'mfe-tasks-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks-board.component.html',
  styleUrls: ['./tasks-board.component.scss'],
})
export class TasksBoardComponent {
  readonly store = inject(TaskStoreService);
  readonly authReader = inject(AUTH_READER_TOKEN, { optional: true });

  readonly isReadOnly = computed<boolean>(() => {
    return this.authReader ? this.authReader.isViewer() : false;
  });

  readonly showAddModal = signal(false);

  // Form State
  newTitle = '';
  newDescription = '';
  newPriority: TaskPriority = 'medium';
  newTagsString = '';

  openModal(): void {
    if (this.isReadOnly()) return;
    this.newTitle = '';
    this.newDescription = '';
    this.newPriority = 'medium';
    this.newTagsString = '';
    this.showAddModal.set(true);
  }

  closeModal(): void {
    this.showAddModal.set(false);
  }

  submitNewTask(): void {
    if (this.isReadOnly() || !this.newTitle.trim()) return;

    const tags = this.newTagsString
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    this.store.addTask({
      title: this.newTitle.trim(),
      description: this.newDescription.trim() || 'No description provided.',
      priority: this.newPriority,
      tags: tags.length ? tags : ['General'],
    });

    this.closeModal();
  }

  moveTask(taskId: string, direction: 'forward' | 'backward'): void {
    if (this.isReadOnly()) return;
    this.store.moveTask(taskId, direction);
  }

  deleteTask(taskId: string): void {
    if (this.isReadOnly()) return;
    this.store.deleteTask(taskId);
  }

  onFilterChange(priority: TaskPriority | 'all'): void {
    this.store.setPriorityFilter(priority);
  }

  onSearch(query: string): void {
    this.store.setSearchQuery(query);
  }
}
