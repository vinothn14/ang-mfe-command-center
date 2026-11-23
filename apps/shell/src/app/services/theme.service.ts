import { Injectable, effect, inject, signal } from '@angular/core';
import { DEFAULT_THEME_MODE, DEFAULT_THEME_STORAGE_KEY, ThemeMode } from '@mfe/shared/ui-tokens';
import { EventBusService } from '@mfe/shared/event-bus';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly eventBus = inject(EventBusService);

  readonly mode = signal<ThemeMode>(this.getInitialTheme());

  constructor() {
    // Reactive sync between signal, DOM and event bus
    effect(() => {
      const currentMode = this.mode();
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', currentMode);
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(DEFAULT_THEME_STORAGE_KEY, currentMode);
      }
      this.eventBus.dispatch('theme:changed', currentMode);
    });
  }

  toggleTheme(): void {
    this.mode.update(m => (m === 'dark' ? 'light' : 'dark'));
  }

  setTheme(newMode: ThemeMode): void {
    this.mode.set(newMode);
  }

  private getInitialTheme(): ThemeMode {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(DEFAULT_THEME_STORAGE_KEY) as ThemeMode | null;
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    }
    return DEFAULT_THEME_MODE;
  }
}
