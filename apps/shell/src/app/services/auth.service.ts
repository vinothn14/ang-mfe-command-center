import { Injectable, inject, signal } from '@angular/core';
import { AuthState, INITIAL_AUTH_STATE, User } from '@mfe/shared/contracts';
import { EventBusService } from '@mfe/shared/event-bus';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly eventBus = inject(EventBusService);

  readonly authState = signal<AuthState>(INITIAL_AUTH_STATE);

  constructor() {
    // Initial broadcast to event bus so remotes have auth on boot
    this.eventBus.dispatch('auth:state-changed', this.authState());
  }

  login(): void {
    const state: AuthState = {
      ...INITIAL_AUTH_STATE,
      isAuthenticated: true,
      lastLogin: new Date().toISOString(),
    };
    this.authState.set(state);
    this.eventBus.dispatch('auth:state-changed', state);
  }

  logout(): void {
    const state: AuthState = {
      isAuthenticated: false,
      user: null,
      token: null,
      lastLogin: null,
    };
    this.authState.set(state);
    this.eventBus.dispatch('auth:state-changed', state);
  }

  switchRole(role: User['role']): void {
    const current = this.authState();
    if (!current.user) return;

    const updatedUser: User = { ...current.user, role };
    const updatedState: AuthState = { ...current, user: updatedUser };

    this.authState.set(updatedState);
    this.eventBus.dispatch('auth:state-changed', updatedState);
  }
}
