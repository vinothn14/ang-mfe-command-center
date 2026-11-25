import { AuthState, UserRole } from './auth.contract';
import { TaskItem, TaskStatusChangeEvent } from './task.contract';

export interface RemoteLoadMetadata {
  remoteName: string;
  url: string;
  timestamp: number;
}

export interface RemoteErrorMetadata {
  remoteName: string;
  remoteVersion?: string;
  error: string;
  timestamp: number;
}

export interface EventMap {
  'auth:state-changed': AuthState;
  'auth:role-switched': UserRole;
  'auth:logout': void;
  'auth:login': void;
  'theme:changed': 'light' | 'dark';
  'task:created': TaskItem;
  'task:status-changed': TaskStatusChangeEvent;
  'task:deleted': { taskId: string; timestamp: number };
  'remote:loaded': RemoteLoadMetadata;
  'remote:error': RemoteErrorMetadata;
}

export type EventKey = keyof EventMap;

/**
 * Framework-agnostic EventBus adapter for non-Angular Web Component remotes.
 */
export interface EventBusAdapter {
  subscribe<K extends EventKey>(event: K, handler: (payload: EventMap[K]) => void): () => void;
  subscribeWithReplay<K extends EventKey>(
    event: K,
    handler: (payload: EventMap[K]) => void,
  ): () => void;
  dispatch<K extends EventKey>(event: K, payload: EventMap[K]): void;
}
