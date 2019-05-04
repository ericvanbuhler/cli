import { deserializeRpcResponse } from './deserialize-rpc-response';
import { runAndCatch } from '@carnesen/run-and-catch';
import { CodedError } from '@carnesen/coded-error';
describe(deserializeRpcResponse.name, () => {
  it('returns the "result" field if there is one', () => {
    const result = deserializeRpcResponse(JSON.stringify({ result: 'foo' }));
    expect(result).toBe('foo');
  });

  it('throws "no result" if the response has neither "result" nor "message"', async () => {
    const ex = await runAndCatch(deserializeRpcResponse, '{}');
    expect(ex.message).toMatch(/no result/i);
  });

  it('throws an error constructed from the response message', async () => {
    const response = { message: 'hello', code: 'HI', data: 'foo' };
    const ex = await runAndCatch(deserializeRpcResponse, JSON.stringify(response));
    expect(ex).toEqual(new CodedError('hello', 'HI', 'foo'));
  });
});
