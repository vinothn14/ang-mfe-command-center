import { describe, it, expect, beforeEach } from 'vitest';
import { EventBusService } from './event-bus.service';
import { INITIAL_AUTH_STATE } from '@mfe/shared/contracts';

describe('EventBusService', () => {
  let eventBus: EventBusService;

  beforeEach(() => {
    // Reset global state for test isolation
    if (typeof window !== 'undefined') {
      delete (window as any).__MFE_GLOBAL_EVENT_BUS__;
    }
    eventBus = new EventBusService();
  });

  it('should dispatch and receive typed events via on() observable', () => {
    let receivedAuth: any = null;

    const sub = eventBus.on('auth:state-changed').subscribe(auth => {
      receivedAuth = auth;
    });

    eventBus.dispatch('auth:state-changed', INITIAL_AUTH_STATE);

    expect(receivedAuth).toEqual(INITIAL_AUTH_STATE);
    sub.unsubscribe();
  });

  it('should ignore events of differing keys', () => {
    let receivedTheme: any = null;

    const sub = eventBus.on('theme:changed').subscribe(theme => {
      receivedTheme = theme;
    });

    eventBus.dispatch('auth:login', undefined);
    expect(receivedTheme).toBeNull();

    eventBus.dispatch('theme:changed', 'light');
    expect(receivedTheme).toBe('light');

    sub.unsubscribe();
  });

  it('should update Signal with toSignal() helper', () => {
    const themeSignal = eventBus.toSignal('theme:changed', 'dark');
    expect(themeSignal()).toBe('dark');

    eventBus.dispatch('theme:changed', 'light');
    expect(themeSignal()).toBe('light');
  });
});
