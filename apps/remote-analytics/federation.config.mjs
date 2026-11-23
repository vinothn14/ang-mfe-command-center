import { withNativeFederation, shareAll, share } from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'remote-analytics',
  exposes: {
    './Component': './apps/remote-analytics/src/app/analytics/analytics-dashboard.component.ts',
    './Routes': './apps/remote-analytics/src/app/remote-entry/entry.routes.ts',
  },
  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
      includeSecondaries: true,
    }),
    ...share({
      '@mfe/shared/event-bus': {
        singleton: true,
        strictVersion: false,
        requiredVersion: false,
      },
      '@mfe/shared/contracts': {
        singleton: true,
        strictVersion: false,
        requiredVersion: false,
      },
      '@mfe/shared/ui-tokens': {
        singleton: true,
        strictVersion: false,
        requiredVersion: false,
      },
    }),
  },
  features: {
    denseExternals: true,
  },
  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],
});
