import { CredentialsStore } from '@alwaysai/cloud-api-nodejs';
import { FatalError } from '@alwaysai/always-cli';

export function checkLoggedIn() {
  const store = new CredentialsStore();
  const credentials = store.read();
  if (!credentials) {
    throw new FatalError(
      'Authentication is required for this action. Please run "alwaysai user logIn"',
    );
  }
  return credentials.username;
}
