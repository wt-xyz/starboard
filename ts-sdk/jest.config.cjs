module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
    '^long$': require.resolve('long'),
  },
  transformIgnorePatterns: [],
  globals: {
    'ts-jest': {
      isolatedModules: true,
      diagnostics: false,
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },
  coveragePathIgnorePatterns: ['src/codegen/'],
};
