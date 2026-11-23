import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SettingsStoreService } from './settings-store.service';
import { EventBusService } from '@mfe/shared/event-bus';

describe('SettingsStoreService', () => {
  let store: SettingsStoreService;
  let eventBus: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SettingsStoreService, EventBusService],
    });
    store = TestBed.inject(SettingsStoreService);
    eventBus = TestBed.inject(EventBusService);
  });

  it('should initialize with default settings values', () => {
    expect(store.name()).toBeTruthy();
    expect(store.email()).toBeTruthy();
    expect(store.theme()).toBe('dark');
    expect(store.notifications().emailAlerts).toBe(true);
  });

  it('should dispatch theme:changed and settings:theme-changed when setTheme is called', () => {
    let capturedTheme: any = null;
    let capturedSettingsEvent: any = null;

    eventBus.on('theme:changed').subscribe(val => (capturedTheme = val));
    eventBus.on('settings:theme-changed').subscribe(val => (capturedSettingsEvent = val));

    store.setTheme('light');

    expect(store.theme()).toBe('light');
    expect(capturedTheme).toBe('light');
    expect(capturedSettingsEvent.theme).toBe('light');
    expect(capturedSettingsEvent.updatedBy).toBe(store.name());
  });

  it('should toggle notification settings correctly', () => {
    const initial = store.notifications().emailAlerts;
    store.toggleNotification('emailAlerts');
    expect(store.notifications().emailAlerts).toBe(!initial);
  });

  it('should trigger isSaved state on saveSettings', () => {
    expect(store.isSaved()).toBe(false);
    store.saveSettings();
    expect(store.isSaved()).toBe(true);
  });
});
