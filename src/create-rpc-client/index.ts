import { cast } from '@alwaysai/codecs';
import { rpcMethodSpecs, RpcApi, RpcRequest } from '@alwaysai/cloud-api';

import { createSendRpcData } from './create-send-rpc-data';
import { deserializeRpcResponse } from './deserialize-rpc-response';

import { readSystemId } from '../cli-config-file';
import { credentialsStore } from '../credentials-store';

let cloudApiUrl: string;
switch (readSystemId()) {
  case 'local':
    cloudApiUrl = 'http://localhost:8000';
    break;
  case 'development':
    cloudApiUrl = 'https://alwaysai-dev.appspot.com';
    break;
  case 'production':
    cloudApiUrl = 'https://alwaysai.appspot.com';
    break;
  default:
    throw new Error('Unsupported systemId');
}

export function createRpcClient(): RpcApi {
  const { idToken } = credentialsStore.read();
  const sendRpcData = createSendRpcData({ idToken, cloudApiUrl });

  const rpcClient: any = {};
  for (const [methodName, { argsCodec }] of Object.entries(rpcMethodSpecs)) {
    rpcClient[methodName] = async (...rawArgs: unknown[]) => {
      // Client-side validation of args
      const args = cast(argsCodec as any, rawArgs);
      // Prepare request
      const rpcRequest: RpcRequest = {
        methodName,
        args: args as unknown[],
      };
      const data = JSON.stringify(rpcRequest);

      // Send request
      const responseData = await sendRpcData(data);

      // Process response
      const result = deserializeRpcResponse(responseData);
      return result;
    };
  }
  return rpcClient;
}
