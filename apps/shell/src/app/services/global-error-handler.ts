import { ErrorHandler, Injectable, Injector, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ERROR_REPORTER_TOKEN } from '@mfe/shared/contracts';

const ROUTE_REMOTE_MAP: Record<string, { remoteName: string; remoteVersion: string }> = {
  '/tasks': { remoteName: 'remote-tasks', remoteVersion: '0.1.0' },
  '/analytics': { remoteName: 'remote-analytics', remoteVersion: '0.1.0' },
  '/settings': { remoteName: 'remote-settings', remoteVersion: '0.1.0' },
  '/widget': { remoteName: 'remote-widget', remoteVersion: '0.1.0' },
};

@Injectable()
export class MfeGlobalErrorHandler implements ErrorHandler {
  private readonly injector = inject(Injector);
  private readonly errorReporter = inject(ERROR_REPORTER_TOKEN);

  handleError(error: unknown): void {
    const router = this.injector.get(Router, null);
    const currentUrl = router?.url ?? '/';
    const matchedPrefix = Object.keys(ROUTE_REMOTE_MAP).find(prefix =>
      currentUrl.startsWith(prefix),
    );
    const remoteMeta = matchedPrefix
      ? ROUTE_REMOTE_MAP[matchedPrefix]
      : { remoteName: 'shell', remoteVersion: '0.1.0' };

    this.errorReporter.captureException(error, {
      remoteName: remoteMeta.remoteName,
      remoteVersion: remoteMeta.remoteVersion,
      route: currentUrl,
      tags: { phase: 'unhandled-runtime-error' },
    });
  }
}
