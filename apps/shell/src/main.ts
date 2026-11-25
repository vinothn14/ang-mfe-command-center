import { initFederation } from '@angular-architects/native-federation';

// Environment-aware manifest resolution:
// Resolves local development manifest on localhost / 127.0.0.1,
// or production manifest when deployed (Vercel production or preview).
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.local'));

const customManifest =
  typeof window !== 'undefined'
    ? (window as unknown as { __MFE_MANIFEST_URL__?: string }).__MFE_MANIFEST_URL__
    : undefined;

const manifestEndpoint =
  customManifest || (isLocalhost ? 'federation.manifest.json' : 'federation.manifest.prod.json');

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

initFederation(manifestEndpoint)
  .catch(err => {
    console.warn(
      `[Shell] Native Federation manifest load error from "${manifestEndpoint}" (proceeding with fallback capability):`,
      err,
    );
    return null;
  })
  .then(() => import('./bootstrap'))
  .catch(err => renderBootstrapError('Shell', err));
