export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Level [0..2]: 0=disable, 1=warning, 2=error
    // Always applicable
    // Value

    // Ensure type is lower case (feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert)
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only
        'style', // Formatting, missing semi colons, etc
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf', // Code change that improves performance
        'test', // Adding missing tests
        'build', // Build system or external dependencies
        'ci', // CI configuration
        'chore', // Maintenance
        'revert', // Revert a previous commit
      ],
    ],
    // Subject must not be empty
    'subject-empty': [2, 'never'],
    // Subject must not end with period
    'subject-full-stop': [2, 'never', '.'],
    // Type must be lower case
    'type-case': [2, 'always', 'lower-case'],
  },
};
