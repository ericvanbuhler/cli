import prompts = require('prompts');
import { TerseError } from '@alwaysai/always-cli';

type Questions<T extends string> = prompts.PromptObject<T>[];

export function checkTerminalIsInteractive() {
  if (!process.stdin.isTTY) {
    throw new TerseError(
      'This feature is disabled when standard input (stdin) is not a TTY',
    );
  }
  if (!process.stdout.isTTY) {
    throw new TerseError(
      'This feature is disabled when standard output (stdout) is not a TTY',
    );
  }
}

export async function prompt<T extends string>(questions: Questions<T>) {
  checkTerminalIsInteractive();
  let canceled = false;
  const answers = await prompts(questions, {
    onCancel() {
      canceled = true;
    },
  });
  if (canceled) {
    throw new TerseError('Operation canceled by user');
  }
  return answers;
}
