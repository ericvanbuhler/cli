import { Option, checkArgvHasValue } from '@alwaysai/always-cli';
import prompts = require('prompts');

export const username: Option<string> = {
  async getValue(argv) {
    if (argv) {
      checkArgvHasValue(argv);
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
  placeholder: '<user>',
};
