/// <reference lib="dom" />
(global as any).fetch = require('node-fetch');
// ^^ Attaches `fetch` polyfill to global scope

import { Auth as CognitoAuth } from 'aws-amplify';
import { CognitoUser } from '@aws-amplify/auth';
import { CognitoUserSession } from 'amazon-cognito-identity-js';

import { credentialsStore } from './credentials-store';
import { AWS_REGION } from './constants';
import { userPoolId, userPoolClientId } from './config';

CognitoAuth.configure({
  region: AWS_REGION,
  storage: credentialsStore,
  userPoolId,
  userPoolWebClientId: userPoolClientId,
  authenticationFlowType: 'USER_PASSWORD_AUTH',
});

type User = CognitoUser & { challengeName?: string };

export async function getCurrentUser() {
  try {
    const user: User = await CognitoAuth.currentUserPoolUser();
    return user;
  } catch (ex) {
    // https://github.com/aws-amplify/amplify-js/blob/e679bf57e8bf8d9de0a9142e9161f8bfb93aef08/packages/auth/src/Auth.ts#L963
    if (ex === 'No current user') {
      return undefined;
    }
    throw ex;
  }
}

export async function getBearerToken() {
  let session: CognitoUserSession | undefined = undefined;
  try {
    session = await CognitoAuth.currentSession();
  } catch (ex) {
    if (ex !== 'No current user') {
      throw ex;
    }
  }
  if (session) {
    return session.getAccessToken().getJwtToken();
  }
  return undefined;
}

export { CognitoAuth };
