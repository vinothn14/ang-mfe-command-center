import { Injectable, inject, signal } from '@angular/core';
import { EventBusService } from '@mfe/shared/event-bus';
import { AUTH_READER_TOKEN } from '@mfe/shared/contracts';

export interface NotificationSettings {
  emailAlerts: boolean;
  slackDigest: boolean;
  statusSound: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsStoreService {
  private readonly eventBus = inject(EventBusService);
  private readonly authReader = inject(AUTH_READER_TOKEN, { optional: true });

  // Signal-based form state
  readonly name = signal(this.authReader?.authState().user?.name || 'Alex Rivera');
  readonly email = signal(this.authReader?.authState().user?.email || 'alex.rivera@enterprise-mfe.io');
  readonly organization = signal('Command Center Core Team');
  readonly theme = signal<'light' | 'dark'>('dark');
  readonly notifications = signal<NotificationSettings>({
    emailAlerts: true,
    slackDigest: false,
    statusSound: true,
  });

  readonly isSaved = signal(false);

  constructor() {
    // Listen to shell theme toggles to keep settings form in sync
    this.eventBus.on('theme:changed').subscribe(newTheme => {
      this.theme.set(newTheme);
    });
  }

  setTheme(newTheme: 'light' | 'dark'): void {
    this.theme.set(newTheme);
    // Propagate theme changes back to shell and all remotes via EventBus
    this.eventBus.dispatch('theme:changed', newTheme);
    this.eventBus.dispatch('settings:theme-changed', {
      theme: newTheme,
      updatedBy: this.name(),
      timestamp: Date.now(),
    });
  }

  toggleNotification(key: keyof NotificationSettings): void {
    this.notifications.update(curr => ({
      ...curr,
      [key]: !curr[key],
    }));
  }

  saveSettings(): void {
    this.isSaved.set(true);
    // Notify shell of theme update on save
    this.eventBus.dispatch('settings:theme-changed', {
      theme: this.theme(),
      updatedBy: this.name(),
      timestamp: Date.now(),
    });

    setTimeout(() => {
      this.isSaved.set(false);
    }, 2500);
  }
}
