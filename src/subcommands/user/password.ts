import { UsageError, Input, TerseError } from '@alwaysai/always-cli';
import { prompt } from '../../prompt';

const placeholder = '<password>';

export async function promptForPassword() {
  const response = await prompt([
    {
      type: 'password',
      name: 'password',
      message: 'Password',
    },
  ]);
  if (!response) {
    throw new TerseError('Value "password" is required');
  }
  return response.password;
}

export const password: Input<string | undefined, false> = {
  async getValue(argv) {
    if (!argv) {
      return undefined;
    }
    if (argv.length > 2) {
      throw new UsageError(`Expected a single ${placeholder} value`);
    }
    if (!argv[0]) {
      throw new UsageError(`Expected a ${placeholder} value`);
    }
    return argv[0];
  },
  getDescription() {
    return 'An alwaysAI password';
  },
  placeholder,
  required: false,
};
