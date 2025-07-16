module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 60000,  // Set global timeout to 60 seconds for all tests
  roots: ['<rootDir>/tests'],  // Look for tests in the tests directory
  verbose: false,
  silent: false,
  collectCoverage: false
};
