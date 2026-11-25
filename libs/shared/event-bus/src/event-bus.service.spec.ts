import { describe, it, expect, beforeEach } from 'vitest';
import { EventBusService } from './event-bus.service';
import { INITIAL_AUTH_STATE } from '@mfe/shared/contracts';

describe('EventBusService', () => {
  let eventBus: EventBusService;

  beforeEach(() => {
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

  it('should replay buffered events to late subscribers via onWithReplay()', () => {
    eventBus.dispatch('task:created', {
      id: 'TSK-777',
      title: 'Pre-mount task',
      description: 'Created before analytics mounted',
      status: 'todo',
      priority: 'high',
      assignee: { name: 'Alex Rivera', avatarUrl: '' },
      tags: ['Replay'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const received: string[] = [];
    const sub = eventBus.onWithReplay('task:created').subscribe(task => {
      received.push(task.id);
    });

    expect(received).toEqual(['TSK-777']);
    sub.unsubscribe();
  });
});
