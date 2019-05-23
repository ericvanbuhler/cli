import { cast } from '@alwaysai/codecs';
import { rpcMethodSpecs, RpcApi, RpcRequest } from '@alwaysai/cloud-api';

import { createSendRpcData } from './create-send-rpc-data';
import { deserializeRpcResponse } from './deserialize-rpc-response';

import { readSystemId } from '../cli-config-file';
import { getAccessToken, checkLoggedIn } from '../cognito-auth';
import { TerseError } from '@alwaysai/alwayscli';

let cloudApiUrl: string;
switch (readSystemId()) {
  case 'local':
    cloudApiUrl = 'http://localhost:8000';
    break;
  case 'development':
  case 'production':
    cloudApiUrl = 'http://cloud-api-586812470.us-west-2.elb.amazonaws.com/';
    break;
  default:
    throw new Error('Unsupported systemId');
}

export async function createRpcClient(): Promise<RpcApi> {
  let idToken: string;

  try {
    idToken = await getAccessToken();
    await checkLoggedIn();
  } catch (e) {
    throw new TerseError('Please login to continue');
  }
  return new Promise<RpcApi>(resolve => {
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
    resolve(rpcClient);
  });
}
