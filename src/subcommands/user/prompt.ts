import prompts = require('prompts');
import { TerseError } from '@alwaysai/always-cli';

export async function prompt(...args: Parameters<typeof prompts>) {
  if (!process.stdout.isTTY) {
    throw new TerseError(
      'This feature is disabled because Node.js is not running as a TTY',
    );
  }
  let canceled = false;
  const [questions, opts = {}] = args;
  const response = await prompts(questions, {
    onCancel() {
      canceled = true;
    },
    ...opts,
  });
  if (canceled) {
    return undefined;
  }
  return response;
}
