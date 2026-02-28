/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  moduleNameMapper: {
    '^@snake/core$': '<rootDir>/../../packages/snake-core/src/index.ts',
  },
  moduleFileExtensions: ['ts', 'js'],
  clearMocks: true,
}
