import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ERROR_REPORTER_TOKEN, ErrorReporter } from '@mfe/shared/contracts';
import { MfeGlobalErrorHandler } from './global-error-handler';

describe('MfeGlobalErrorHandler', () => {
  it('should report unhandled remote errors with remoteName and remoteVersion', () => {
    const mockReporter: ErrorReporter = {
      captureException: vi.fn(),
      captureMessage: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        MfeGlobalErrorHandler,
        { provide: ERROR_REPORTER_TOKEN, useValue: mockReporter },
        { provide: Router, useValue: { url: '/tasks' } },
      ],
    });

    const handler = TestBed.inject(MfeGlobalErrorHandler);
    const err = new Error('Unhandled Kanban failure');
    handler.handleError(err);

    expect(mockReporter.captureException).toHaveBeenCalledWith(err, {
      remoteName: 'remote-tasks',
      remoteVersion: '0.1.0',
      route: '/tasks',
      tags: { phase: 'unhandled-runtime-error' },
    });
  });

  it('should attribute errors on root route to shell', () => {
    const mockReporter: ErrorReporter = {
      captureException: vi.fn(),
      captureMessage: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        MfeGlobalErrorHandler,
        { provide: ERROR_REPORTER_TOKEN, useValue: mockReporter },
        { provide: Router, useValue: { url: '/' } },
      ],
    });

    const handler = TestBed.inject(MfeGlobalErrorHandler);
    const err = new Error('Shell boom');
    handler.handleError(err);

    expect(mockReporter.captureException).toHaveBeenCalledWith(err, {
      remoteName: 'shell',
      remoteVersion: '0.1.0',
      route: '/',
      tags: { phase: 'unhandled-runtime-error' },
    });
  });
});
