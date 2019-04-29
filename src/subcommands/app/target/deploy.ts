import { createLeaf } from '@alwaysai/always-cli';

import { createTarbombStream } from '../../../create-tarbomb-stream';
import { appConfigFile } from '../../../app-config-file';
import { targetConfigFile } from './target-config-file';
import { spinOnPromise } from '../../../spin-on-promise';

export const deploy = createLeaf({
  name: 'deploy',
  description: 'Deploy this alwaysAI application to the development target',
  options: {},
  async action() {
    appConfigFile.read();
    const sshClient = await targetConfigFile.connectToTarget();
    const packageStream = createTarbombStream(process.cwd());
    await spinOnPromise(sshClient.mkdirp(), 'Create directory');
    await spinOnPromise(
      sshClient.runCommand('tar xvcz -', { input: packageStream }),
      'Copy files',
    );
  },
});
