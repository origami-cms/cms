module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  setupTestFrameworkScriptFile: "jest-extended",
  collectCoverageFrom: [
    'packages/**/*.{ts}',
    '!packages/**/*.d.ts',
    '!**/node_modules/**',
  ],
  roots: [
    'packages/',
  ],
  watchPathIgnorePatterns: [
    "\.db\.json",
    "packages\/\.*\/node_modules"
  ]
};
