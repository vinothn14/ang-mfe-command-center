import { withNativeFederation, shareAll, share } from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'remote-tasks',
  exposes: {
    './Component': './apps/remote-tasks/src/app/tasks-board/tasks-board.component.ts',
    './Routes': './apps/remote-tasks/src/app/remote-entry/entry.routes.ts',
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
        requiredVersion: 'auto',
      },
      '@mfe/shared/contracts': {
        singleton: true,
        strictVersion: false,
        requiredVersion: 'auto',
      },
      '@mfe/shared/ui-tokens': {
        singleton: true,
        strictVersion: false,
        requiredVersion: 'auto',
      },
    }),
  },
  features: {
    denseExternals: true,
  },
  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],
});
