import { Choice } from 'prompts';

import { TerseError, UsageError } from '@alwaysai/alwayscli';

import { prompt, getNonInteractiveStreamName } from '../../../../prompt';
import { TargetProtocol } from '../../../../target-protocol';
import { SshSpawner } from '../../../../spawner/ssh-spawner';
import { JsSpawner } from '../../../../spawner/js-spawner';

import { validatePath, options } from './options';
import logSymbols = require('log-symbols');
import ora = require('ora');
import { echo } from '../../../../echo';

export async function checkForDocker(
  opts: Partial<{ hostname: string; yes: boolean }> = {},
) {
  const spawner = opts.hostname
    ? SshSpawner({ hostname: opts.hostname, path: '/tmp' })
    : JsSpawner();
  const spinner = ora('Check for "docker" executable');
  try {
    await spawner.run({ exe: 'docker', args: ['--version'] });
    spinner.succeed();
  } catch (ex) {
    spinner.fail('Command "docker --version" failed.');
    echo(ex.message);
    await promptToConfirmSave(opts.yes || false);
  }
}

export async function promptForProtocol(initialProtocol: TargetProtocol) {
  const choices: Choice[] = [
    { title: 'On a remote host accessible via ssh', value: TargetProtocol['ssh:'] },
    { title: 'In a docker container on this host', value: TargetProtocol['docker:'] },
    {
      title: 'In a docker container on a remote host accessible via ssh',
      value: TargetProtocol['ssh+docker:'],
    },
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
  const spinner = ora('Check connectivity');
  try {
    const spawner = SshSpawner({ hostname, path: '/tmp' });
    await spawner.run({ exe: 'ls' });
    connected = true;
    spinner.succeed();
  } catch (ex) {
    spinner.fail('Connection to target host failed');
    if (ex.message) {
      echo(ex.message);
    }
    await promptToConfirmSave(yes);
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
    const spinner = ora('Check filesystem permissions');
    try {
      const spawner = SshSpawner({ hostname, path });
      await spawner.mkdirp();
      spinner.succeed();
    } catch (ex) {
      spinner.fail('Failed to create application directory on target system');
      if (ex.message) {
        echo(ex.message);
      }
      await promptToConfirmSave(yes);
    }
  }

  return path;
}

async function promptToConfirmSave(yes: boolean) {
  if (yes) {
    echo(
      logSymbols.warning,
      "We'll save this configuration despite failed checks because --yes was passed",
    );
    return;
  }
  if (getNonInteractiveStreamName()) {
    throw new TerseError(
      'The above error is fatal because this terminal is not interactive nor was "--yes" passed as a command-line option.',
    );
  }

  const answers = await prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: 'Do you want to save this configuration?',
      initial: false,
    },
  ]);

  if (!answers.confirmed) {
    throw new TerseError('Operation canceled by user');
  }
}
