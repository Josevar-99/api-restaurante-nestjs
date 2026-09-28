/**
 * Jest configuration, ESM flavoured to match the "type": "module" manifest.
 *
 * This file replaced the duplicate jest.config.cjs: having both, plus a "jest"
 * key in package.json, made jest refuse to start with
 * "Multiple configurations found".
 *
 * @type {import('jest').Config}
 */
export default {
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testRegex: '.*\\.spec\\.ts$',
  extensionsToTreatAsEsm: ['.ts'],
  // Loads jest.setup.mjs, which publishes the `jest` object on globalThis.
  // Under ESM jest does not inject it into module scope, so the unit tests
  // that call jest.fn() depend on this file being loaded.
  setupFilesAfterEnv: ['./jest.setup.mjs'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: './tsconfig.spec.json' }],
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: 'coverage',
};
