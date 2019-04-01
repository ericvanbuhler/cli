import prompts = require('prompts');

import { UsageError, Input } from '@alwaysai/always-cli';

const placeholder = '<password>';

export const password: Input<string, false> = {
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
      type: 'password',
      name: 'password',
      message: 'Password',
    });
    return response.password;
  },
  getDescription() {
    return 'An alwaysAI password';
  },
  placeholder,
  required: false,
};
