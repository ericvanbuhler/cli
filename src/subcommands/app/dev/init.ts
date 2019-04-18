import { createLeaf, TerseError } from '@alwaysai/always-cli';
import { devConfigFile } from './dev-config-file';
import { SandboxUrl } from '../../../sandbox-url';
import { isAbsolute, basename } from 'path';
import { prompt, checkTerminalIsInteractive } from '../../../prompt';
import { DEFAULT_PORT, DEFAULT_USERNAME, SshClient } from '../../../ssh-client';
import chalk from 'chalk';
import { spinOnPromise } from '../../../spin-on-promise';

async function confirmSave() {
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

export const init = createLeaf({
  name: 'init',
  description: "Initialize this directory's remote sandbox configuration",
  options: {},
  async action() {
    checkTerminalIsInteractive();
    const paragraphs: any[] = [
      'Welcome! This command will configure this directory for development with a remote sandbox.',
    ];
    const existingDevConfig = devConfigFile.readIfExists();
    const promptInitialValues = {
      hostname: undefined,
      port: undefined,
      username: undefined,
      password: undefined,
      pathname: '/',
    };

    if (existingDevConfig) {
      const parsed = SandboxUrl.parse(existingDevConfig.sandboxUrl);
      paragraphs.push('Here is your current dev configuration:');
      paragraphs.push(parsed);
      Object.assign(promptInitialValues, parsed);
    }

    for (const paragraph of paragraphs) {
      console.log(paragraph);
      console.log();
    }

    const answers = await prompt([
      {
        type: 'text',
        name: 'hostname',
        message: 'Hostname or IP address',
        initial: promptInitialValues.hostname,
        validate: value => (!value ? 'Value is required' : true),
      },
      {
        type: 'number',
        name: 'port',
        message: `Ssh port (if different than ${DEFAULT_PORT})`,
        initial: promptInitialValues.port,
      },
      {
        type: 'text',
        name: 'username',
        message: `Username (if different than ${DEFAULT_USERNAME})`,
        initial: promptInitialValues.username,
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password (if necessary)',
        initial: promptInitialValues.password,
      },
      {
        type: 'text',
        name: 'pathname',
        message: 'Filesystem path',
        initial: promptInitialValues.pathname,
        validate: value =>
          !value
            ? 'Value is required'
            : value === '/'
            ? 'The filesystem root "/" is not a valid sandbox directory'
            : !isAbsolute(value)
            ? 'Value must be an absolute path'
            : true,
      },
    ]);

    const serialized = SandboxUrl.serialize({ protocol: 'ssh:', ...answers });
    const sandboxUrl = SandboxUrl.parse(serialized);

    console.log();
    console.log('Here is the new dev configuration:');
    console.log();
    console.log(sandboxUrl);
    console.log();
    console.log('Check permissions and connectivity:');
    console.log();
    const sshClient = new SshClient(sandboxUrl);
    let connected = false;
    try {
      await spinOnPromise(sshClient.connect(), 'Test connection');
      connected = true;
    } catch (ex) {
      console.log(`${chalk.red('Error:')} ${ex.message || 'Could not connect'}`);
      await confirmSave();
    }

    if (connected) {
      try {
        await spinOnPromise(
          sshClient.mkdirp(sandboxUrl.pathname),
          'Create sandbox directory',
        );
      } catch (ex) {
        console.log(
          `${chalk.red('Error:')} ${ex.message || 'Could not create directory'}`,
        );
        await confirmSave();
      }
    }

    const { changed } = devConfigFile.write({ sandboxUrl: serialized });
    console.log();
    if (changed) {
      return `Wrote "${basename(devConfigFile.path)}"`;
    }
    return `"${basename(devConfigFile.path)}" has not changed`;
  },
});
