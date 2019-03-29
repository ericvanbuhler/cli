import prompts = require('prompts');

import { Option, FatalError } from '@alwaysai/always-cli';

const placeholder = '<username>';

export const username: Option<string, false> = {
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
