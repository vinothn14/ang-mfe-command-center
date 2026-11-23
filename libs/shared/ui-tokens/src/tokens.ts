export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  mode: ThemeMode;
  storageKey: string;
}

export const DEFAULT_THEME_STORAGE_KEY = 'mfe_command_center_theme';
export const DEFAULT_THEME_MODE: ThemeMode = 'dark';
