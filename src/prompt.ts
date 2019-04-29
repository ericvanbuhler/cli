import prompts = require('prompts');
import { TerseError } from '@alwaysai/always-cli';

type Questions<T extends string> = prompts.PromptObject<T>[];

export function getNonInteractiveStandardStreamName() {
  for (const streamName of ['stdin' as const, 'stdout' as const]) {
    if (!process[streamName].isTTY) {
      return streamName;
    }
  }
  return undefined;
}

export function checkTerminalIsInteractive() {
  const streamName = getNonInteractiveStandardStreamName();
  if (streamName) {
    throw new TerseError(
      `This feature is disabled when standard ${
        streamName === 'stdin' ? 'input' : 'output'
      } (${streamName}) is not a TTY`,
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
