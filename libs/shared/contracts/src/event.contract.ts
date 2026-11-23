import { AuthState, UserRole } from './auth.contract';
import { TaskItem, TaskStatusChangeEvent } from './task.contract';

export interface RemoteLoadMetadata {
  remoteName: string;
  url: string;
  timestamp: number;
}

export interface RemoteErrorMetadata {
  remoteName: string;
  error: string;
  timestamp: number;
}

export interface SettingsThemeChangeEvent {
  theme: 'light' | 'dark';
  updatedBy: string;
  timestamp: number;
}

export interface EventMap {
  'auth:state-changed': AuthState;
  'auth:role-switched': UserRole;
  'auth:logout': void;
  'auth:login': void;
  'theme:changed': 'light' | 'dark';
  'settings:theme-changed': SettingsThemeChangeEvent;
  'task:created': TaskItem;
  'task:status-changed': TaskStatusChangeEvent;
  'task:deleted': { taskId: string; timestamp: number };
  'remote:loaded': RemoteLoadMetadata;
  'remote:error': RemoteErrorMetadata;
}

export type EventKey = keyof EventMap;
