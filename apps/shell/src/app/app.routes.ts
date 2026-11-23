import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RemoteLoaderComponent } from './components/remote-loader/remote-loader.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'tasks',
    component: RemoteLoaderComponent,
    data: {
      remoteName: 'remote-tasks',
      exposedModule: './Component',
      remoteUrl: 'http://localhost:4201/remoteEntry.json',
    },
  },
  {
    path: 'missing-remote',
    component: RemoteLoaderComponent,
    data: {
      remoteName: 'remote-analytics',
      exposedModule: './Component',
      remoteUrl: 'http://localhost:4202/remoteEntry.json',
    },
  },
  {
    path: '**',
    redirectTo: '',
  },
];
