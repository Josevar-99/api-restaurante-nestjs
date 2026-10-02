/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  extensionsToTreatAsEsm: ['.ts'],
  setupFilesAfterEnv: ['./jest.setup.mjs'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: './tsconfig.spec.json' }],
  },
};