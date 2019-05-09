import {
  createLeaf,
  TerseError,
  createStringInput,
  UsageError,
} from '@alwaysai/alwayscli';
import { isAbsolute, basename } from 'path';
import chalk from 'chalk';

import { prompt, getNonInteractiveStandardStreamName } from '../../../prompt';
import { spinOnPromise } from '../../../spin-on-promise';
import { yes } from '../../../inputs/yes';
import { targetConfigFile } from './target-config-file';
import { SshSpawner } from '../../../spawner/ssh-spawner';

function validatePath(value: string) {
  return !value
    ? 'Value is required'
    : value === '/'
    ? 'The filesystem root "/" is not a valid target directory'
    : !isAbsolute(value)
    ? 'Value must be an absolute path'
    : undefined;
}

async function confirmSave(errorMessage: string, yes: boolean) {
  if (getNonInteractiveStandardStreamName()) {
    // Shell is not interactive
    if (!yes) {
      throw new TerseError(errorMessage);
    }
  } else {
    // Shell is interactive
    if (yes) {
      return;
    }
    console.log(errorMessage);
    const answers = await prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: 'Do you want to save this configuration?',
      },
    ]);
    if (!answers.confirmed) {
      throw new TerseError('Operation canceled by user');
    }
  }
}

type AnyConfig = { [name: string]: any };
export function mergeConfigs(
  config0: AnyConfig,
  config1: AnyConfig,
  ...configs: AnyConfig[]
): AnyConfig {
  const mergedConfig: AnyConfig = {};
  const names0 = Object.keys(config0);
  const names1 = Object.keys(config1);
  const uniqueNames = new Set([...names0, ...names1]);
  for (const name of uniqueNames) {
    const value0 = config0[name];
    const value1 = config1[name];
    // Drop explicit `undefined`s
    if (typeof value1 !== 'undefined') {
      mergedConfig[name] = value1;
      continue;
    }
    if (typeof value0 !== 'undefined') {
      mergedConfig[name] = value0;
      continue;
    }
  }
  if (configs.length > 0) {
    return mergeConfigs(mergedConfig, configs[0], ...configs.slice(1));
  }
  return mergedConfig;
}

const path = createStringInput({
  description: 'Absolute path for the application on the target system',
});
const originalGetValue = path.getValue;
path.getValue = async argv => {
  const path = await originalGetValue(argv);
  if (typeof path === 'undefined') {
    return path;
  }
  const errorMessage = validatePath(path);
  if (errorMessage) {
    throw new UsageError(errorMessage);
  }
  return path;
};

const options = {
  yes,
  hostname: createStringInput({
    description: 'Hostname or IP address',
  }),
  path,
};

export const init = createLeaf({
  name: 'init',
  description: 'Initialize an application development target',
  options,
  async action(_, { yes, ...passedConfig }) {
    const existingConfig = targetConfigFile.readIfExists();

    // If the user passed --yes, check whether we have a value for all required fields
    if (yes && !existingConfig) {
      for (const optionName of ['hostname' as const, 'path' as const]) {
        if (typeof passedConfig[optionName] === 'undefined') {
          throw new UsageError(
            `--${optionName} is required with --yes if there is not an existing configuration`,
          );
        }
      }
    }

    // If the user did not pass --yes, check whether we are in an interactive shell
    if (!yes) {
      const streamName = getNonInteractiveStandardStreamName();
      if (streamName) {
        throw new UsageError(
          `Standard ${
            streamName === 'stdin' ? 'input' : 'output'
          } (${streamName}) is not a TTY. Use --yes to disable interactive prompts.`,
        );
      }
    }

    const paragraphs: any[] = [];
    paragraphs.push(
      "Welcome! This command will set up this application's development deployment target",
    );

    if (existingConfig) {
      paragraphs.push('Here is your current configuration:');
      paragraphs.push(existingConfig);
    }

    for (const paragraph of paragraphs) {
      console.log(paragraph);
      console.log();
    }

    let nextConfig: AnyConfig;
    if (yes) {
      nextConfig = existingConfig
        ? mergeConfigs(existingConfig, passedConfig)
        : passedConfig;
    } else {
      const promptConfig = {
        path: '/',
      };

      const promptInitialValues = existingConfig
        ? mergeConfigs(promptConfig, existingConfig, passedConfig)
        : mergeConfigs(promptConfig, passedConfig);

      const answers = await prompt([
        {
          type: 'text',
          name: 'hostname',
          message: options.hostname.getDescription(),
          initial: promptInitialValues.hostname,
          validate: value => (!value ? 'Value is required' : true),
        },
        {
          type: 'text',
          name: 'path',
          message: options.path.getDescription(),
          initial: promptInitialValues.path,
          validate: value => validatePath(value) || true,
        },
      ]);
      nextConfig = {};
      for (const [name, value] of Object.entries(answers)) {
        if (value) {
          nextConfig[name] = value;
        }
      }
    }
    console.log();
    console.log('Here is the new configuration:');
    console.log();
    console.log(nextConfig);
    console.log();
    console.log('Check permissions and connectivity:');
    console.log();
    const ssh = SshSpawner(nextConfig as any);
    let connected = false;
    try {
      await spinOnPromise(ssh.runCommand({ exe: 'ls' }), 'Test connection');
      connected = true;
    } catch (ex) {
      await confirmSave(
        `${chalk.red('Error:')} ${ex.message || 'Could not connect'}`,
        yes,
      );
    }

    if (connected) {
      try {
        await spinOnPromise(ssh.mkdirp(), 'Create target directory');
      } catch (ex) {
        await confirmSave(
          `${chalk.red('Error:')} ${ex.message || 'Could not create directory'}`,
          yes,
        );
      }
    }

    nextConfig.protocol = 'ssh:';
    const { changed } = targetConfigFile.write(nextConfig as any);
    console.log();
    if (changed) {
      return `Wrote "${basename(targetConfigFile.path)}"`;
    }
    return `"${basename(targetConfigFile.path)}" has not changed`;
  },
});
