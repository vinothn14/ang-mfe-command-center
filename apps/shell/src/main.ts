import { initFederation } from '@angular-architects/native-federation';

// Environment-aware manifest resolution:
// Resolves local development manifest on localhost / 127.0.0.1,
// or production manifest when deployed (Netlify, CDN, or staging).
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.local'));

const manifestEndpoint = isLocalhost ? 'federation.manifest.json' : 'federation.manifest.prod.json';

initFederation(manifestEndpoint)
  .catch(err => {
    console.warn(
      `[Shell] Native Federation manifest load error from "${manifestEndpoint}" (proceeding with fallback capability):`,
      err,
    );
    return null;
  })
  .then(() => import('./bootstrap'))
  .catch(err => console.error('[Shell] Bootstrap failure:', err));
