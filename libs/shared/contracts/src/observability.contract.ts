import { InjectionToken } from '@angular/core';

export interface ErrorContext {
  remoteName?: string;
  remoteVersion?: string;
  url?: string;
  route?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

/**
 * Vendor-agnostic observability / error-reporting contract.
 * Defaults to ConsoleErrorReporter; swap with Sentry/Datadog/OTel in appConfig.
 */
export interface ErrorReporter {
  captureException(error: unknown, context?: ErrorContext): void;
  captureMessage(
    message: string,
    level?: 'info' | 'warning' | 'error',
    context?: ErrorContext,
  ): void;
}

export class ConsoleErrorReporter implements ErrorReporter {
  captureException(error: unknown, context?: ErrorContext): void {
    console.error('[MFE Observability]', {
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
      ...context,
      timestamp: new Date().toISOString(),
    });
  }

  captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
    context?: ErrorContext,
  ): void {
    const logger =
      level === 'error' ? console.error : level === 'warning' ? console.warn : console.info;
    logger('[MFE Observability]', {
      message,
      level,
      ...context,
      timestamp: new Date().toISOString(),
    });
  }
}

export const ERROR_REPORTER_TOKEN = new InjectionToken<ErrorReporter>('ERROR_REPORTER_TOKEN', {
  providedIn: 'root',
  factory: () => new ConsoleErrorReporter(),
});
