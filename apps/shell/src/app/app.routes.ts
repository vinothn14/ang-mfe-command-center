import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RemoteLoaderComponent } from './components/remote-loader/remote-loader.component';
import { WidgetHostComponent } from './components/widget-host/widget-host.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { settingsRoleGuard } from './guards/role.guard';

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
    path: 'analytics',
    component: RemoteLoaderComponent,
    data: {
      remoteName: 'remote-analytics',
      exposedModule: './Component',
      remoteUrl: 'http://localhost:4202/remoteEntry.json',
    },
  },
  {
    path: 'settings',
    component: RemoteLoaderComponent,
    canActivate: [settingsRoleGuard],
    data: {
      remoteName: 'remote-settings',
      exposedModule: './Component',
      remoteUrl: 'http://localhost:4203/remoteEntry.json',
    },
  },
  {
    path: 'widget',
    component: WidgetHostComponent,
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent,
  },
  {
    path: 'missing-remote',
    component: RemoteLoaderComponent,
    data: {
      remoteName: 'remote-billing',
      exposedModule: './Component',
      remoteUrl: 'http://localhost:4299/remoteEntry.json',
    },
  },
  {
    path: '**',
    redirectTo: '',
  },
];
