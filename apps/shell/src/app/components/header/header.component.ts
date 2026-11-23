import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);

  readonly currentTheme = this.themeService.mode;
  readonly authState = this.authService.authState;

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleAuth(): void {
    if (this.authState().isAuthenticated) {
      this.authService.logout();
    } else {
      this.authService.login();
    }
  }

  cycleRole(): void {
    const roles: Array<'architect' | 'admin' | 'developer' | 'viewer'> = [
      'architect',
      'admin',
      'developer',
      'viewer',
    ];
    const current = this.authState().user?.role || 'architect';
    const nextIndex = (roles.indexOf(current) + 1) % roles.length;
    this.authService.switchRole(roles[nextIndex]);
  }
}
