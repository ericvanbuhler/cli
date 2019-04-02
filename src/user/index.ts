import { createLeaf, createBranch } from '@alwaysai/always-cli';
import { createRpcClient, CredentialsStore } from '@alwaysai/cloud-api-nodejs';

import { cloudApi } from '../cloud-api';
import { username } from './username';
import { password } from './password';

const logIn = createLeaf({
  name: 'logIn',
  description: 'Log in to the alwaysAI Cloud',
  options: {
    username,
    password,
    cloudApi,
  },
  async action(_, { cloudApi, ...credentials }) {
    const rpcClient = createRpcClient({ cloudApiUrl: cloudApi, credentials });
    await rpcClient.getNull();
    const store = new CredentialsStore();
    store.write(credentials);
    return `Logged in as "${credentials.username}"`;
  },
});

const logOut = createLeaf({
  name: 'logOut',
  description: 'Log out of the alwaysAI Cloud',
  options: {},
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
  name: 'show',
  description: 'Show the currently logged in user',
  options: {},
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
  name: 'user',
  description: 'Log in or log out of the alwaysAI cloud',
  subcommands: [logIn, logOut, show],
});
