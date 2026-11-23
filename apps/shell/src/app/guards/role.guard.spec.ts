import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { settingsRoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { EventBusService } from '@mfe/shared/event-bus';

describe('settingsRoleGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        EventBusService,
        {
          provide: Router,
          useValue: {
            parseUrl: (url: string) => url,
            navigate: () => Promise.resolve(true),
          },
        },
      ],
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should allow navigation for architect role', () => {
    authService.switchRole('architect');
    const result = TestBed.runInInjectionContext(() => settingsRoleGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('should redirect to /access-denied for viewer role', () => {
    authService.switchRole('viewer');
    const result = TestBed.runInInjectionContext(() => settingsRoleGuard({} as any, {} as any));
    expect(result).toBe('/access-denied');
  });
});
