import { basename } from 'path';

import { createLeaf, UsageError } from '@alwaysai/alwayscli';

import { getNonInteractiveStreamName } from '../../../../prompt';
import { TargetProtocol } from '../../../../target-protocol';

import { targetConfigFile } from '../target-config-file';
import { options } from './options';
import {
  promptForProtocol,
  promptForPath,
  promptForHostname,
  checkForDocker,
} from './prompts';

export const init = createLeaf({
  name: 'init',
  description: 'Initialize an application development target',
  options,
  async action(_, { yes, ...passed }) {
    const { changed } = yes
      ? await runYesInterface({ yes, ...passed })
      : await runPromptedInterface({ yes, ...passed });

    if (changed) {
      return `Wrote "${basename(targetConfigFile.path)}"`;
    }
    return `"${basename(targetConfigFile.path)}" has not changed`;
  },
});

type NamedInputs = Parameters<typeof init.action>[1];

async function runYesInterface({ yes, ...passed }: NamedInputs) {
  const { protocol } = passed;
  switch (protocol) {
    case undefined: {
      throw new UsageError('--protocol is required with --yes');
    }

    case TargetProtocol['docker:']: {
      for (const optionName of ['hostname' as const, 'path' as const]) {
        if (passed[optionName]) {
          throw new UsageError(
            `--${optionName} is not allowed for protocol "${protocol}"`,
          );
        }
      }
      await checkForDocker({ yes });
      return targetConfigFile.write({ protocol });
    }

    case TargetProtocol['ssh:']: {
      const { connected, hostname } = await promptForHostname(passed.hostname || '', yes);
      const path = await promptForPath(passed.path || '', connected ? hostname : '', yes);
      return targetConfigFile.write({
        protocol,
        hostname,
        path,
      });
    }

    case TargetProtocol['ssh+docker:']: {
      const { connected, hostname } = await promptForHostname(passed.hostname || '', yes);
      await checkForDocker({ hostname: passed.hostname, yes });
      const path = await promptForPath(passed.path || '', connected ? hostname : '', yes);
      return targetConfigFile.write({
        protocol,
        hostname,
        path,
      });
    }

    default: {
      throw new Error('Unexpected protocol');
    }
  }
}

async function runPromptedInterface({ yes, ...passed }: NamedInputs) {
  // If the user did not pass --yes, check whether we are in an interactive shell

  const streamName = getNonInteractiveStreamName();
  if (streamName) {
    throw new UsageError(
      `${streamName} is not a TTY. Use --yes to disable interactive prompts.`,
    );
  }

  const paragraphs: any[] = [];
  paragraphs.push(
    "Welcome! This command will set up this application's remote development target",
  );

  const existing = targetConfigFile.readIfExists();
  if (existing) {
    paragraphs.push('Here is your current configuration:');
    paragraphs.push(targetConfigFile.describe());
  }

  for (const paragraph of paragraphs) {
    console.log(`${paragraph}\n`);
  }

  const protocol = await promptForProtocol(
    passed.protocol || (existing && existing.protocol) || TargetProtocol['docker:'],
  );

  switch (protocol) {
    case 'docker:': {
      return targetConfigFile.write({ protocol });
    }
    case 'ssh+docker:': {
      const { connected, hostname } = await promptForHostname(
        passed.hostname ||
          (existing && existing.protocol === protocol && existing.hostname) ||
          '',
        yes,
      );
      const path = await promptForPath(
        passed.path ||
          (existing && existing.protocol === protocol && existing.path) ||
          '/',
        connected ? hostname : undefined,
        yes,
      );
      await checkForDocker({ hostname, yes });
      return targetConfigFile.write({ protocol, hostname, path });
    }
    case 'ssh:': {
      const { connected, hostname } = await promptForHostname(
        passed.hostname ||
          (existing && existing.protocol === protocol && existing.hostname) ||
          '',
        yes,
      );
      const path = await promptForPath(
        passed.path || (existing && existing.protocol === 'ssh:' && existing.path) || '/',
        connected ? hostname : undefined,
        yes,
      );
      return targetConfigFile.write({ protocol, hostname, path });
    }
    default: {
      throw new Error('Unexpected protocol');
    }
  }
}
