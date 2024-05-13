/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      // TODO: @merlin fix, it doesn't work
      // tests are emitting files
      {
        tsconfig: {
          allowJs: true,
        },
      },
    ],
  },
  testRegex: '(/__tests__/(?!utils).*|(\\.|/)(test|spec)(?!.utils.))\\.tsx?$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'node',
};
