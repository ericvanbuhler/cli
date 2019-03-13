import { Option, checkArgvHasValue } from '@alwaysai/always-cli';
import prompts = require('prompts');

export const password: Option<string> = {
  async getValue(argv) {
    if (argv) {
      checkArgvHasValue(argv);
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
  placeholder: '<password>',
};
