import { RpcApi } from '@alwaysai/cloud-api';
import { createRpcClient as originalCreateRpcClient } from '@alwaysai/cloud-api-nodejs';

import { readSystemId } from './cli-config-file';
import { credentialsStore } from './credentials-store';
import { firebaseAuth } from './firebase-auth';

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

export function createRpcClient() {
  const { idToken, password, email } = credentialsStore.read();
  const rpcClient = originalCreateRpcClient({
    idToken,
    cloudApiUrl,
    async getIdToken() {
      const { user } = await firebaseAuth.signInWithEmailAndPassword(email, password);
      if (!user) {
        throw new Error('Expected "user"');
      }
      const freshIdToken = await user.getIdToken();
      credentialsStore.update(config => {
        config.idToken = freshIdToken;
      });
      return freshIdToken;
    },
  });
  return rpcClient as RpcApi;
}
