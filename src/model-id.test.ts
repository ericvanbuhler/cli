import { ModelId } from './model-id';

const { parse, serialize } = ModelId;

const parseData: ([string, ReturnType<typeof parse>])[] = [
  ['foo/bar', { publisher: 'foo', name: 'bar' }],
];

describe('ModelId', () => {
  for (const [serialized, ModelId] of parseData) {
    it(`parses "${serialized}"`, () => {
      expect(parse(serialized)).toEqual(ModelId);
    });
  }

  it('throws "expected model"', () => {
    expect(() => parse('ssh://foo/')).toThrow(/expected model/i);
    expect(() => parse('foo/bar/baz')).toThrow(/expected model/i);
  });

  it('consistency checks', () => {
    const serialized = 'foo/bar';
    expect(serialize(parse(serialized))).toBe(serialized);
  });
});
