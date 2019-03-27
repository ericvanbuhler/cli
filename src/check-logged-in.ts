import { CredentialsStore } from '@alwaysai/cloud-api-nodejs';
import { FatalError } from '@alwaysai/always-cli';

export function checkLoggedIn() {
  const store = new CredentialsStore();
  const credentials = store.read();
  if (!credentials) {
    throw new FatalError('You must be logged in to perform this action');
  }
  return credentials.username;
}
