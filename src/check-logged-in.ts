import { CredentialsStore } from '@alwaysai/cloud-api-nodejs';
import { TerseError } from '@alwaysai/always-cli';

export function checkLoggedIn() {
  const store = new CredentialsStore();
  const credentials = store.read();
  if (!credentials) {
    throw new TerseError(
      'Authentication is required for this action. Please run "alwaysai user logIn"',
    );
  }
  return credentials.username;
}
