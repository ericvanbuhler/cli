import { parseHost } from './parse-host';

export type SandboxUrl = {
  protocol: 'ssh:';
  hostname?: string;
  pathname: string;
  port?: number;
  username?: string;
  password?: string;
};

export const SandboxUrl = {
  parse,
  serialize,
};

const SSH_COLON_SLASH_SLASH = 'ssh://';

function splitString(str: string, separator: string) {
  const indexOfSeparator = str.indexOf(separator);
  let chunk: string | undefined = undefined;
  let rest = str;
  if (indexOfSeparator > -1) {
    chunk = str.slice(0, indexOfSeparator);
    rest = str.slice(indexOfSeparator + separator.length);
  }
  return [chunk, rest] as [string | undefined, string];
}

function parse(serialized: string) {
  // URL should start with "ssh://"
  // Example: serialized = "ssh://user:pass@[1.2.3.4]:5678/foo/bar"
  const [beforeProtocol, afterProtocol] = splitString(serialized, SSH_COLON_SLASH_SLASH);
  if (beforeProtocol !== '') {
    throw new Error(`Expected sandbox URL to start with "${SSH_COLON_SLASH_SLASH}"`);
  }
  const partial: Partial<SandboxUrl> = {
    protocol: 'ssh:',
  };

  // Find the "@" character which indicates the user has provided a username and password
  // Example: afterProtocol = "user:pass@[1.2.3.4]:5678/foo/bar"
  const [beforeAt, afterAt] = splitString(afterProtocol, '@');
  if (beforeAt) {
    // Example: beforeAt = "user:pass"
    const [beforeColon, afterColon] = splitString(beforeAt, ':');
    if (typeof beforeColon !== 'undefined') {
      partial.username = beforeColon;
      partial.password = afterColon;
    } else {
      partial.username = beforeAt;
    }
  }

  // Example: afterAt = [1.2.3.4]:5678/foo/bar;
  const [beforeSlash, afterSlash] = splitString(afterAt, '/');
  if (!beforeSlash || afterSlash.length === 0) {
    throw new Error('Expected URL to end with a filesystem directory ".../some/path"');
  }
  partial.pathname = `/${afterSlash}`;
  const { hostname, port } = parseHost(beforeSlash);
  const isIpv6 = hostname.split(':').length > 2;

  const sandboxUrl: SandboxUrl = {
    ...partial,
    protocol: 'ssh:',
    hostname: isIpv6 ? `[${hostname}]` : hostname,
    port,
    pathname: partial.pathname,
  };
  return sandboxUrl;
}

function serialize(sandboxUrl: SandboxUrl) {
  const { protocol, hostname, port, username, password, pathname } = sandboxUrl;
  let serialized = `${protocol}//`;
  let shouldWriteAt = false;
  if (username) {
    serialized += username;
    shouldWriteAt = true;
  }
  if (password) {
    serialized += `:${password}`;
    shouldWriteAt = true;
  }
  if (shouldWriteAt) {
    serialized += '@';
  }
  if (hostname) {
    serialized += hostname;
  }
  if (typeof port !== 'undefined') {
    serialized += `:${port}`;
  }
  serialized += pathname;
  return serialized;
}
