import { Routes } from '@angular/router';
import { TasksBoardComponent } from '../tasks-board/tasks-board.component';

export const TASKS_ROUTES: Routes = [
  {
    path: '',
    component: TasksBoardComponent,
  },
];

export default TASKS_ROUTES;
