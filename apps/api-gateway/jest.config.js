/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.controller.ts',
    '!src/**/dto/**/*.ts',
    '!src/**/guards/**/*.ts',
    '!src/**/decorators/**/*.ts',
    '!src/**/strategies/**/*.ts',
    '!src/auth/**/*.ts',
    '!src/app.service.ts',
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


