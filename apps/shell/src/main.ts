import { initFederation } from '@angular-architects/native-federation';

initFederation('federation.manifest.json')
  .catch(err => {
    console.warn('[Shell] Native Federation manifest load error (proceeding with fallback capability):', err);
    return null;
  })
  .then(() => import('./bootstrap'))
  .catch(err => console.error('[Shell] Bootstrap failure:', err));
