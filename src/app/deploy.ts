import { URL } from 'url';

import { createLeaf, Input, UsageError } from '@alwaysai/always-cli';

import { createPackageStream } from '../create-package-stream';
import { SshClient } from '../ssh-client';
import { appConfigFile } from '../app-config-file';

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
const description = `
  WHATWG URL of the deployment target, e.g.
   "${example}"`;

const to: Input<DeploymentTarget, true> = {
  placeholder,
  required: true,
  getDescription() {
    return description;
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
      throw new UsageError(`Failed to parse value as URL`);
    }
    const { protocol, hostname, port, username, password, pathname } = url;
    if (protocol !== 'ssh:') {
      throw new UsageError(`Protocol of the URL must be "ssh:"`);
    }
    if (!pathname || pathname === '/') {
      throw new UsageError(`URL must include a filesystem path`);
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
  name: 'deploy',
  description: 'Deploy an alwaysAI application to a device',
  options: {
    to,
  },
  async action(_, { to }) {
    appConfigFile.read();
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
