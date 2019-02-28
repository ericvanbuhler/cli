import { Option, UsageError } from '@alwaysai/always-cli';

export const username: Option<string> = {
  getValue(argv) {
    if (argv && typeof argv[0] !== 'undefined') {
      return argv[0];
    }
    throw new UsageError('Argument is required');
  },
  getDescription() {
    return 'An alwaysAI username';
  },
  placeholder: '<str>',
};
