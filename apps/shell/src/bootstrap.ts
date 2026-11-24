import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { renderBootstrapError } from './main';

bootstrapApplication(AppComponent, appConfig).catch(err => {
  renderBootstrapError('Shell', err);
});
