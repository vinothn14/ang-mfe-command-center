import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsStoreService } from './settings-store.service';
import { AUTH_READER_TOKEN } from '@mfe/shared/contracts';

@Component({
  selector: 'mfe-settings-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-form.component.html',
  styleUrls: ['./settings-form.component.scss'],
})
export class SettingsFormComponent {
  readonly store = inject(SettingsStoreService);
  readonly authReader = inject(AUTH_READER_TOKEN, { optional: true });

  onThemeSelect(theme: 'light' | 'dark'): void {
    this.store.setTheme(theme);
  }

  save(): void {
    this.store.saveSettings();
  }
}
