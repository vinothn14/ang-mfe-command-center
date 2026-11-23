import { initFederation } from '@angular-architects/native-federation';

initFederation()
  .catch(err => console.warn('[Remote-Settings] Standalone federation init warning:', err))
  .then(() => import('./bootstrap'))
  .catch(err => console.error('[Remote-Settings] Bootstrap failure:', err));
