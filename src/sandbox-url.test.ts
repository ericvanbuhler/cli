import { SandboxUrl } from './sandbox-url';

const { parse, serialize } = SandboxUrl;

const parseData: ([string, ReturnType<typeof parse>])[] = [
  [
    'ssh://localhost:23/foo',
    { protocol: 'ssh:', port: 23, hostname: 'localhost', pathname: '/foo' },
  ],
  [
    'ssh://user@h/foo',
    { protocol: 'ssh:', username: 'user', hostname: 'h', pathname: '/foo' },
  ],
  [
    'ssh://user:pass@foo/foo',
    {
      protocol: 'ssh:',
      username: 'user',
      password: 'pass',
      hostname: 'foo',
      pathname: '/foo',
    },
  ],
];

describe('SandboxUrl', () => {
  for (const [serialized, sandboxUrl] of parseData) {
    it(`parses "${serialized}"`, () => {
      expect(parse(serialized)).toEqual(sandboxUrl);
    });
  }

  it('throws "to end with" if the path is "" or "/"', () => {
    expect(() => parse('ssh://foo/')).toThrow(/to end with/i);
    expect(() => parse('ssh://foo')).toThrow(/to end with/i);
  });

  it('throws "ssh:" if the protocol is not "ssh:"', () => {
    expect(() => parse('sh://foo')).toThrow(/to start with/i);
  });

  it('throws "failed to parse value as URL" if the URL is bad', () => {
    expect(() => parse('ssh://foo::::')).toThrow(/failed to parse value as URL/i);
  });

  it('consistency checks', () => {
    const serialized = 'ssh://user:@h:/foo';
    expect(serialize(parse(serialized))).toBe(serialized);
  });
});
