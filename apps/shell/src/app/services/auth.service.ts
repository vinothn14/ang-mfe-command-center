import { Injectable, computed, inject, signal } from '@angular/core';
import {
  AuthReader,
  AuthState,
  INITIAL_AUTH_STATE,
  UserRole,
  canAccessSettings,
  canModifyTasks,
} from '@mfe/shared/contracts';
import { EventBusService } from '@mfe/shared/event-bus';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements AuthReader {
  private readonly eventBus = inject(EventBusService);

  readonly authState = signal<AuthState>(INITIAL_AUTH_STATE);

  readonly role = computed<UserRole>(() => this.authState().user?.role || 'viewer');
  readonly isViewer = computed<boolean>(() => this.role() === 'viewer');
  readonly canModifyTasks = computed<boolean>(() => canModifyTasks(this.role()));
  readonly canAccessSettings = computed<boolean>(() => canAccessSettings(this.role()));

  constructor() {
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

  switchRole(role: UserRole): void {
    const current = this.authState();
    if (!current.user) {
      if (role !== 'viewer') {
        this.login();
        this.switchRole(role);
      }
      return;
    }

    const updatedUser = { ...current.user, role };
    const updatedState: AuthState = { ...current, user: updatedUser };

    this.authState.set(updatedState);
    this.eventBus.dispatch('auth:state-changed', updatedState);
    this.eventBus.dispatch('auth:role-switched', role);
  }
}
