import nx from '@nx/eslint-plugin';
import angular from 'angular-eslint';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'].map(config => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
  })),
  ...nx.configs['flat/javascript'].map(config => ({
    ...config,
    files: ['**/*.js', '**/*.jsx', '**/*.mjs'],
  })),
  ...angular.configs.tsRecommended.map(config => ({
    ...config,
    files: ['**/*.ts'],
  })),
  ...angular.configs.templateRecommended.map(config => ({
    ...config,
    files: ['**/*.html'],
  })),
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.nx/**',
      '**/.angular/**',
      '**/coverage/**',
    ],
  },
  {
    files: ['**/*.ts'],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: ['app', 'mfe'],
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: ['app', 'mfe'],
          style: 'kebab-case',
        },
      ],
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:shell',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:remote-tasks',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:remote-analytics',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:remote-settings',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:remote-widget',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
          ],
        },
      ],
    },
  },
];
