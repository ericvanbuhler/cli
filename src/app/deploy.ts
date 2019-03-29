import { URL } from 'url';

import { createLeaf, Option, UsageError, FatalError } from '@alwaysai/always-cli';

import { checkAppConfigFile } from '../app-config-file';
import { createPackageStream } from '../create-package-stream';
import { SshClient } from '../ssh-client';

type DeploymentTarget = {
  protocol: string;
  hostname: string;
  pathname: string;
  port?: number;
  username?: string;
  password?: string;
};

const example = 'ssh://user:pass@1.2.3.4/some/path';
const placeholder = '<url>';

const to: Option<DeploymentTarget, true> = {
  placeholder,
  required: true,
  getDescription() {
    return 'Destination to which to deploy';
  },
  getValue(argv) {
    if (!argv[0]) {
      throw new UsageError(`Expected a ${placeholder}`);
    }
    const arg0 = argv[0];
    let url: URL;
    try {
      url = new URL(arg0);
    } catch (ex) {
      throw new FatalError(`Failed to parse "${arg0}" as a URL`);
    }
    const { protocol, hostname, port, username, password, pathname } = url;
    if (protocol !== 'ssh:') {
      throw new FatalError('Protocol must be "ssh:"');
    }
    if (!pathname) {
      throw new FatalError(`URL must include target path e.g. "${example}"`);
    }
    return {
      protocol,
      hostname,
      port: port ? Number(port) : undefined,
      username: username || undefined,
      password: password || undefined,
      pathname,
    };
  },
};

export const deploy = createLeaf({
  commandName: 'deploy',
  description: 'Deploy an alwaysAI app',
  options: {
    to,
  },
  async action({ to }) {
    checkAppConfigFile();
    const { username = 'alwaysai', password, port, hostname, pathname } = to;
    const sshClient = new SshClient({
      hostname,
      port,
      username,
      password,
    });
    await sshClient.connect();
    const packageStream = createPackageStream(process.cwd());
    return await sshClient.unPackage(pathname, packageStream);
  },
});
