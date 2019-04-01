import { createLeaf, createBranch } from '@alwaysai/always-cli';
import { createRpcClient, CredentialsStore } from '@alwaysai/cloud-api-nodejs';

import { cloudApiUrl } from '../cloud-api-url';
import { username } from './username';
import { password } from './password';

const logIn = createLeaf({
  commandName: 'logIn',
  description: 'Log in to the alwaysAI Cloud',
  namedInputs: {
    username,
    password,
    cloudApiUrl,
  },
  async action({ cloudApiUrl, ...credentials }) {
    const rpcClient = createRpcClient({ cloudApiUrl, credentials });
    await rpcClient.getNull();
    const store = new CredentialsStore();
    store.write(credentials);
    return `Logged in as "${credentials.username}"`;
  },
});

const logOut = createLeaf({
  commandName: 'logOut',
  description: 'Log out of the alwaysAI Cloud',
  namedInputs: {},
  action() {
    const store = new CredentialsStore();
    const credentials = store.read();
    if (credentials) {
      store.remove();
      return `Logged out "${credentials.username}"`;
    }
    return 'Not logged in';
  },
});

const show = createLeaf({
  commandName: 'show',
  description: 'Show the currently logged in user',
  namedInputs: {},
  action() {
    const store = new CredentialsStore();
    const credentials = store.read();
    if (credentials) {
      return `Logged in as "${credentials.username}"`;
    }
    return 'Not logged in';
  },
});

export const user = createBranch({
  commandName: 'user',
  description: 'Log in or log out of the alwaysAI cloud',
  subcommands: [logIn, logOut, show],
});
