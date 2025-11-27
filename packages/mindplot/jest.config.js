const config = {
  testEnvironment: 'jsdom',
  verbose: true,
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    '^.+\\.(ts)?$': 'ts-jest',
    '^.+\\.(js)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(svg)$': '<rootDir>/__mocks__/svgMock.js',
  },
};

module.exports = config;
