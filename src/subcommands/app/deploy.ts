import { createLeaf, Input, UsageError, USAGE } from '@alwaysai/always-cli';

import { createTarbombStream } from '../../create-tarbomb-stream';
import { SshClient } from '../../ssh-client';
import { appConfigFile } from '../../app-config-file';
import { TargetUrl } from '../../target-url';

const example = 'ssh://user:pass@1.2.3.4/some/path';
const placeholder = '<url>';
const description = `
  WHATWG URL of the deployment target, e.g.
   "${example}"`;

const to: Input<TargetUrl, true> = {
  placeholder,
  required: true,
  getDescription() {
    return description;
  },
  getValue(argv) {
    if (!argv[0]) {
      throw new UsageError(`Expected a ${placeholder}`);
    }
    try {
      return TargetUrl.parse(argv[0]);
    } catch (ex) {
      ex.code = USAGE;
      ex.message = ex.message || 'Failed to parse as target URL';
      throw ex;
    }
  },
};

export const deploy = createLeaf({
  name: 'deploy',
  description: 'Deploy an alwaysAI application to a device',
  options: {
    to,
  },
  async action(_, { to }) {
    appConfigFile.read();
    const { username = 'alwaysai', password = 'alwaysai', port, hostname, path } = to;
    const sshClient = new SshClient({
      hostname,
      port,
      username,
      password,
      path,
    });
    await sshClient.connect();
    await sshClient.mkdirp();
    const packageStream = createTarbombStream(process.cwd());
    return await sshClient.runCommand(`tar xvfz -`, { input: packageStream });
  },
});
