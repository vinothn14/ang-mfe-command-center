import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { EVENT_BUS, EventBusService } from '@mfe/shared/event-bus';
import { AUTH_READER_TOKEN } from '@mfe/shared/contracts';
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    {
      provide: EVENT_BUS,
      useExisting: EventBusService,
    },
    {
      provide: AUTH_READER_TOKEN,
      useExisting: AuthService,
    },
  ],
};
