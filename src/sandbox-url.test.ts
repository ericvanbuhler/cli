import { SandboxUrl } from './sandbox-url';

const { parse, serialize } = SandboxUrl;

const data: ([string, ReturnType<typeof parse>])[] = [
  ['ssh://1/foo', { protocol: 'ssh:', hostname: '1', pathname: '/foo' }],
  [
    'ssh://localhost:23/foo',
    { protocol: 'ssh:', port: 23, hostname: 'localhost', pathname: '/foo' },
  ],
  ['ssh://:::23/foo', { protocol: 'ssh:', hostname: '[:::23]', pathname: '/foo' }],
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
  for (const [serialized, sandboxUrl] of data) {
    it(`parses "${serialized}"`, () => {
      expect(parse(serialized)).toEqual(sandboxUrl);
    });

    it('idempotency check', () => {
      const serializedAgain = serialize(parse(serialized));
      // This ^^ value may differ from the original "serialized",
      // but if we re-parse and serialize the serializedAgain
      // we would expect to get the same thing back again (idempotency)
      expect(serialize(parse(serializedAgain))).toBe(serializedAgain);
    });
  }

  it('throws "to end with" if the path is "" or "/"', () => {
    expect(() => parse('ssh://foo/')).toThrow(/to end with/i);
    expect(() => parse('ssh://foo')).toThrow(/to end with/i);
  });

  it('throws "to start with" if the protocol is not "ssh:"', () => {
    expect(() => parse('sh://foo')).toThrow(/to start with/i);
  });
});
