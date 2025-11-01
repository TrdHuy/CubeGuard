/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  collectCoverage: true,
  collectCoverageFrom: ['src/main/BP/**/*.ts', '!src/main/BP/main.ts'],
  coverageReporters: ['text', 'html'],
};
