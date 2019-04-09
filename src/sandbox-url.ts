import { URL } from 'url';

export type SandboxUrl = {
  protocol: 'ssh:';
  hostname: string;
  pathname: string;
  port?: number;
  username?: string;
  password?: string;
};

export const SandboxUrl = {
  parse(serialized: string) {
    if (!serialized.startsWith('ssh://')) {
      throw new Error('Expected sandbox URL to start with "ssh://"');
    }
    let url: URL;
    try {
      url = new URL(serialized);
    } catch (ex) {
      throw new Error(`Failed to parse value as URL`);
    }
    const { hostname, port, username, password, pathname } = url;

    if (!pathname || pathname === '/') {
      throw new Error('Expected sandbox URL to end with a filesystem directory path');
    }

    const sandboxUrl: SandboxUrl = {
      protocol: 'ssh:',
      hostname,
      pathname,
    };
    if (port) {
      sandboxUrl.port = Number(port);
    }
    if (username) {
      sandboxUrl.username = username;
    }
    if (password) {
      sandboxUrl.password = password;
    }
    return sandboxUrl;
  },
  serialize(sandboxUrl: SandboxUrl) {
    const { protocol, hostname, port, username, password, pathname } = sandboxUrl;
    const serialized = `${protocol}//${username || ''}:${password ||
      ''}@${hostname}:${port || ''}${pathname}`;
    return serialized;
  },
};
