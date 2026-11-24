import { bootstrapApplication } from '@angular/platform-browser';
import { provideZoneChangeDetection } from '@angular/core';
import { AppComponent } from './app/app.component';
import { EVENT_BUS, EventBusService } from '@mfe/shared/event-bus';

import { renderBootstrapError } from './main';

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    {
      provide: EVENT_BUS,
      useExisting: EventBusService,
    },
  ],
}).catch(err => renderBootstrapError('Remote-Settings', err));
