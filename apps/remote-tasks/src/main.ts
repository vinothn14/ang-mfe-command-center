import { initFederation } from '@angular-architects/native-federation';

initFederation()
  .catch(err => console.warn('[Remote-Tasks] Standalone federation init warning:', err))
  .then(() => import('./bootstrap'))
  .catch(err => console.error('[Remote-Tasks] Bootstrap failure:', err));
