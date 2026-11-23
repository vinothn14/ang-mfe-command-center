import { InjectionToken } from '@angular/core';
import { EventBusService } from './event-bus.service';

export const EVENT_BUS = new InjectionToken<EventBusService>('EVENT_BUS', {
  providedIn: 'root',
  factory: () => new EventBusService(),
});
