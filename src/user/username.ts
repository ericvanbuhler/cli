import prompts = require('prompts');

import { Input, UsageError } from '@alwaysai/always-cli';

const placeholder = '<username>';

export const username: Input<string, false> = {
  async getValue(argv) {
    if (argv) {
      if (argv.length > 2) {
        throw new UsageError(`Expected a single ${placeholder} value`);
      }
      if (!argv[0]) {
        throw new UsageError(`Expected a ${placeholder} value`);
      }
      return argv[0];
    }
    const response = await prompts({
      type: 'text',
      name: 'username',
      message: 'Username',
    });
    return response.username;
  },
  getDescription() {
    return 'An alwaysAI username';
  },
  placeholder,
  required: false,
};
