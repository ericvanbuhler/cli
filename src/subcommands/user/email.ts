import { Input, UsageError, TerseError } from '@alwaysai/always-cli';
import { prompt } from '../../prompt';

const placeholder = '<address>';

// From https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
export const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export async function promptForEmail() {
  const response = await prompt([
    {
      type: 'text',
      name: 'email',
      message: 'Email address',
      validate: value => emailRegExp.test(value) || `"${value}" is not a valid email`,
    },
  ]);
  if (!response) {
    throw new TerseError('Value "email" is required');
  }
  return response.email as string;
}

export const email: Input<string | undefined, false> = {
  required: false,
  async getValue(argv) {
    if (!argv) {
      return undefined;
    }

    if (argv.length > 2) {
      throw new UsageError(`Expected a single ${placeholder}`);
    }

    if (!argv[0]) {
      throw new UsageError(`Expected an ${placeholder}`);
    }

    if (!emailRegExp.test(argv[0])) {
      throw new TerseError(`"${argv[0]}" is not a valid email`);
    }

    return argv[0];
  },
  getDescription() {
    return 'email address associated with your alwaysAI user account';
  },
  placeholder,
};
