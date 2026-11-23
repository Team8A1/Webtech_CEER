module.exports = {
  rootDir: '..',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', '<rootDir>/backend/node_modules'],
  roots: ['<rootDir>/test-workspace'],
  clearMocks: true,
  collectCoverageFrom: [
    'backend/controllers/**/*.js',
    'backend/middleware/**/*.js',
    'backend/models/**/*.js',
    'backend/utils/**/*.js',
  ],
};
