import { initFederation } from '@angular-architects/native-federation';

export function renderBootstrapError(context: string, err: unknown): void {
  console.error(`[${context}] Fatal bootstrap failure:`, err);
  if (typeof document !== 'undefined') {
    const existing = document.getElementById('mfe-fatal-error-card');
    if (!existing) {
      const container = document.createElement('div');
      container.id = 'mfe-fatal-error-card';
      container.style.cssText =
        'margin: 2rem; padding: 1.5rem; background: #fee2e2; border: 2px solid #ef4444; border-radius: 8px; font-family: system-ui, sans-serif; color: #991b1b;';
      container.innerHTML = `
        <h2 style="margin: 0 0 0.5rem 0; font-size: 1.25rem;">Fatal Application Initialization Error</h2>
        <p style="margin: 0 0 0.5rem 0; font-size: 0.95rem;">${context} failed to bootstrap properly.</p>
        <pre style="margin: 0; padding: 0.5rem; background: #fca5a5; border-radius: 4px; font-size: 0.85rem; overflow-x: auto;">${err instanceof Error ? err.stack || err.message : String(err)}</pre>
      `;
      document.body.appendChild(container);
    }
  }
}

initFederation()
  .catch(err => console.warn('[Remote-Settings] Standalone federation init warning:', err))
  .then(() => import('./bootstrap'))
  .catch(err => renderBootstrapError('Remote-Settings', err));
