import parseJson = require('parse-json');

import { RpcError, RpcResult } from '@alwaysai/cloud-api';
import { CodedError } from '@carnesen/coded-error';

export function deserializeRpcResponse(serialized: string) {
  const parsed = parseJson(serialized);
  if (typeof parsed !== 'object') {
    throw new Error('Expected argument to be an object');
  }

  // Return payload's "result" field if it has one
  const { result } = parsed as RpcResult;
  if (typeof result !== 'undefined') {
    return result;
  }

  // Payload did not have a result. Throw an error instead.
  const { message = 'no result in RPC response', code, data } = parsed as RpcError;
  throw new CodedError(message, code, data);
}
