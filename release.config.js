module.exports = {
  branches: ['main', { name: 'alpha', prerelease: true }],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'docs/CHANGELOG.md',
      },
    ],
    '@semantic-release/gitlab',
    '@semantic-release/npm',
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'docs/CHANGELOG.md'],
        message:
          // eslint-disable-next-line no-template-curly-in-string
          'chore(release): ${nextRelease.version} [skip ci]',
      },
    ],
  ],
};
