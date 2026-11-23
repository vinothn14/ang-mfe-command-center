import { initFederation } from '@angular-architects/native-federation';

initFederation()
  .catch(err => console.warn('[Remote-Analytics] Standalone federation init warning:', err))
  .then(() => import('./bootstrap'))
  .catch(err => console.error('[Remote-Analytics] Bootstrap failure:', err));
