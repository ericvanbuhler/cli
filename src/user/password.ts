import prompts = require('prompts');

import { Option, FatalError } from '@alwaysai/always-cli';

const placeholder = '<password>';

export const password: Option<string, false> = {
  async getValue(argv) {
    if (argv) {
      if (argv.length > 2) {
        throw new FatalError(`Expected a single ${placeholder} value`);
      }
      if (!argv[0]) {
        throw new FatalError(`Expected a ${placeholder} value`);
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
