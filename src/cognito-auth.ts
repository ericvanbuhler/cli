/// <reference lib="dom" />
(global as any).fetch = require('node-fetch');
import Amplify, { Auth } from 'aws-amplify';
import { credentialsStore } from './credentials-store';
import { CodedError } from '@carnesen/coded-error';
const webAuthUrl = 'alwaysai.auth.us-west-2.amazoncognito.com';
const configRegion = 'us-west-2';
const configUserPoolId = 'us-west-2_1qn5QzXzP';
const configUserPoolWebClientId = '3mot5qlvchlui2mqs803fccbvm';
const returnUrl = 'https://alwaysai.auth.us-west-2.amazoncognito.com/';
export const redirectUrl = `https://${webAuthUrl}/login?response_type=code&client_id=${configUserPoolWebClientId}&redirect_uri=${returnUrl}`;
Amplify.configure({
  Auth: {
    // REQUIRED - Amazon Cognito Region
    region: configRegion,
    storage: credentialsStore,

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: configUserPoolId,

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: configUserPoolWebClientId,

    // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
    authenticationFlowType: 'USER_PASSWORD_AUTH',
  },
});

export async function checkLoggedIn() {
  const user = await Auth.currentAuthenticatedUser();
  return user.username;
}

export async function logOutUser() {
  await Auth.signOut();
}

export async function checkSessionExists() {
  await Auth.currentSession();
}

export async function getAccessToken() {
  const token = await Auth.currentSession();
  return token.getAccessToken().getJwtToken();
}

export async function logInUser(username: string, password: string) {
  const user = await Auth.signIn(username, password);
  if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
    // User should be logged in but isnt .... something went badly wrong... check the identity pool
    throw new CodedError('An error has occurred', user.challengeName);
  }

  // Do an additional check to make sure that the above worked
  await Auth.currentSession();
  return username;
}
