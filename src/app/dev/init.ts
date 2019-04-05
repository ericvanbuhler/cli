import prompts = require('prompts');

import { createLeaf } from '@alwaysai/always-cli';
import { devConfigFile } from './dev-config-file';
import { credentialsStore } from '../../credentials-store';
import { SandboxUrl } from '../../sandbox-url';
import { isAbsolute, basename } from 'path';

export const init = createLeaf({
  name: 'init',
  description: "Initialize this directory's remote sandbox configuration",
  options: {},
  async action() {
    credentialsStore.read(); // User must be logged in to perform this action
    const promptInitialValues = {
      hostname: undefined,
      port: undefined,
      username: undefined,
      password: undefined,
      pathname: '/',
    };
    const maybeConfig = devConfigFile.readIfExists();
    if (maybeConfig) {
      const parsed = SandboxUrl.parse(maybeConfig.sandboxUrl);
      Object.assign(promptInitialValues, parsed);
    }
    let canceled = false;
    const answers = await prompts(
      [
        {
          type: 'text',
          name: 'hostname',
          message: 'Hostname or IP address of the alwaysAI device',
          initial: promptInitialValues.hostname,
          validate: value => (!value ? 'Value is required' : true),
        },
        {
          type: 'number',
          name: 'port',
          message: 'ssh service port on the device (defaults to 22)',
          initial: promptInitialValues.port,
        },
        {
          type: 'text',
          name: 'username',
          message: 'Username to use to connect to the device',
          initial: promptInitialValues.username,
        },
        {
          type: 'password',
          name: 'password',
          message: 'Password to use to connect to the device',
          initial: promptInitialValues.password,
        },
        {
          type: 'text',
          name: 'pathname',
          message: 'Sandbox directory on the device',
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
      ],
      {
        onCancel() {
          canceled = true;
        },
      },
    );
    if (canceled) {
      return;
    }
    const sandboxUrl = SandboxUrl.serialize({ protocol: 'ssh:', ...answers });

    const { changed } = devConfigFile.write({ sandboxUrl });
    if (changed) {
      return `Wrote "${basename(devConfigFile.path)}"`;
    }
    return `"${basename(devConfigFile.path)}" has not changed`;
  },
});
