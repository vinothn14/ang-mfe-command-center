import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksBoardComponent } from './tasks-board/tasks-board.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TasksBoardComponent],
  template: `
    <main class="standalone-container">
      <mfe-tasks-board />
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
