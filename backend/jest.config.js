/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  // NOTE: don't set `roots` to tests/ only - Jest's automatic mocking of
  // node_modules packages (see __mocks__/ioredis.ts) requires the
  // __mocks__ folder to be visible under the configured roots, which
  // defaults to rootDir. Restricting roots to tests/ silently breaks that
  // mock and real ioredis connection attempts hang until testTimeout.
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFiles: ['<rootDir>/tests/setup-env.ts'],
  globalSetup: '<rootDir>/tests/global-setup.js',
  testTimeout: 20000,
  // All test files share one SQLite file (prisma/test.db); running them
  // concurrently would cause "database is locked" errors.
  maxWorkers: 1,
};
