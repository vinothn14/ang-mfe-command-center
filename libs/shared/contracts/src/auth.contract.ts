import { InjectionToken, Signal } from '@angular/core';

export type UserRole = 'architect' | 'admin' | 'developer' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  lastLogin: string | null;
}

export interface AuthReader {
  readonly authState: Signal<AuthState>;
  readonly role: Signal<UserRole>;
  readonly isViewer: Signal<boolean>;
  readonly canModifyTasks: Signal<boolean>;
  readonly canAccessSettings: Signal<boolean>;
}

export const AUTH_READER_TOKEN = new InjectionToken<AuthReader>('AUTH_READER_TOKEN');

export const INITIAL_AUTH_STATE: AuthState = {
  isAuthenticated: true,
  user: {
    id: 'usr-42',
    name: 'Alex Rivera',
    email: 'alex.rivera@enterprise-mfe.io',
    role: 'architect',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexMFE',
  },
  token: 'mock-jwt-token-mfe-command-center',
  lastLogin: '2026-11-23T10:00:00.000Z',
};

export function canAccessSettings(role: UserRole): boolean {
  return role !== 'viewer';
}

export function canModifyTasks(role: UserRole): boolean {
  return role !== 'viewer';
}
