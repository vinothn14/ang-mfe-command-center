import { Routes } from '@angular/router';
import { SettingsFormComponent } from '../settings/settings-form.component';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    component: SettingsFormComponent,
  },
];

export default SETTINGS_ROUTES;
