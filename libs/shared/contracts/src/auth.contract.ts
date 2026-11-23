export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'architect' | 'developer' | 'viewer';
  avatarUrl: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  lastLogin: string | null;
}

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
  lastLogin: new Date().toISOString(),
};
