import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/dto/**/*.ts',
    '!src/**/guards/**/*.ts',
    '!src/**/decorators/**/*.ts',
    '!src/**/strategies/**/*.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },
  moduleNameMapper: {
    '^@ecowatch/shared$': '<rootDir>/test/mocks/ecowatch-shared.ts',
  },
};

export default config;


