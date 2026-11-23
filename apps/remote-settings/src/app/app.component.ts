import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsFormComponent } from './settings/settings-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SettingsFormComponent],
  template: `
    <main class="standalone-container">
      <mfe-settings-form />
    </main>
  `,
  styles: [
    `
      .standalone-container {
        min-height: 100vh;
        background-color: var(--color-bg-canvas);
        color: var(--color-text-primary);
      }
    `,
  ],
})
export class AppComponent {}
