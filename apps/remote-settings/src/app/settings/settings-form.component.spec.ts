import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SettingsFormComponent } from './settings-form.component';
import { SettingsStoreService } from './settings-store.service';
import { EventBusService } from '@mfe/shared/event-bus';

describe('SettingsFormComponent', () => {
  let component: SettingsFormComponent;
  let store: SettingsStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SettingsFormComponent],
      providers: [SettingsStoreService, EventBusService],
    });
    const fixture = TestBed.createComponent(SettingsFormComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(SettingsStoreService);
  });

  it('should instantiate and trigger theme selection', () => {
    expect(component).toBeTruthy();
    component.onThemeSelect('light');
    expect(store.theme()).toBe('light');
  });

  it('should trigger save action', () => {
    component.save();
    expect(store.isSaved()).toBe(true);
  });
});
