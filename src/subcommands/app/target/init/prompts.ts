import { Choice } from 'prompts';
import chalk from 'chalk';

import { TerseError, UsageError } from '@alwaysai/alwayscli';

import { prompt, getNonInteractiveStreamName } from '../../../../prompt';
import { TargetProtocol } from '../../../../target-protocol';
import { spinOnPromise } from '../../../../spin-on-promise';
import { SshSpawner } from '../../../../spawner/ssh-spawner';

import { validatePath, options } from './options';

export async function promptForProtocol(initialProtocol: TargetProtocol) {
  const choices: Choice[] = [
    { title: 'In a docker container on this host', value: TargetProtocol['docker:'] },
    { title: 'On a remote host accessible via ssh', value: TargetProtocol['ssh:'] },
  ];

  const initial = choices.findIndex(choice => choice.value === initialProtocol);
  if (initial === -1) {
    throw new Error('Invalid initial value');
  }

  const answer = await prompt([
    {
      type: 'select',
      name: 'protocol',
      message: 'Where do you want to run the application?',
      initial,
      choices,
    },
  ]);

  const protocol: TargetProtocol = answer.protocol;
  return protocol;
}

const RequiredWithYesMessage = (optionName: string) =>
  `--${optionName} is required with --yes when the target protocol is "ssh:"`;

export async function promptForHostname(initialValue: string, yes: boolean) {
  let hostname: string;
  if (yes) {
    if (!initialValue) {
      throw new UsageError(RequiredWithYesMessage('hostname'));
    }
    hostname = initialValue;
  } else {
    const answer = await prompt([
      {
        type: 'text',
        name: 'hostname',
        message: options.hostname.getDescription(),
        initial: initialValue,
        validate: value => (!value ? 'Value is required' : true),
      },
    ]);
    ({ hostname } = answer);
  }
  let connected = false;
  try {
    const spawner = SshSpawner({ hostname, path: '/tmp' });
    await spinOnPromise(spawner.runCommand({ exe: 'ls' }), 'Test connection');
    connected = true;
  } catch (ex) {
    await promptToConfirmSave(
      `${chalk.red('Error:')} ${ex.message || 'Could not connect'}`,
      yes,
    );
  }
  return { connected, hostname };
}

export async function promptForPath(
  initialValue: string,
  hostname: string | undefined,
  yes: boolean,
) {
  let path: string;
  if (yes) {
    if (!initialValue) {
      throw new UsageError(RequiredWithYesMessage('path'));
    }
    path = initialValue;
  } else {
    const answer = await prompt([
      {
        type: 'text',
        name: 'path',
        message: options.path.getDescription(),
        initial: initialValue,
        validate: value => validatePath(value) || true,
      },
    ]);

    path = answer.path;
  }

  if (hostname) {
    try {
      const spawner = SshSpawner({ hostname, path });
      await spinOnPromise(spawner.mkdirp(), 'Create directory');
    } catch (ex) {
      await promptToConfirmSave(
        `${chalk.red('Error:')} ${ex.message || 'Could not create directory'}`,
        yes,
      );
    }
  }

  return path;
}

export async function promptToConfirmSave(errorMessage: string, yes: boolean) {
  if (getNonInteractiveStreamName()) {
    if (!yes) {
      // !interactive && !yes
      throw new TerseError(errorMessage);
    } else {
      // !interactive && yes
    }
  } else {
    if (yes) {
      // interactive && yes
    } else {
      // interactive && !yes
      const answers = await prompt([
        {
          type: 'confirm',
          name: 'confirmed',
          message: 'Do you want to save this configuration?',
          initial: false,
        },
      ]);
      if (!answers.confirmed) {
        throw new Error('Operation canceled by user');
      }
    }
  }
}
