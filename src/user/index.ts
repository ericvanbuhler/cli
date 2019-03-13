import { createBranch, createLeaf } from '@alwaysai/always-cli';
import { username } from './username';
import { password } from './password';
import { writeCredentials, readCredentials, deleteCredentials } from '../credentials';

export const logIn = createLeaf({
  commandName: 'logIn',
  description: 'Log in to the alwaysAI cloud',
  options: {
    username,
    password,
  },
  action({ username, password }) {
    writeCredentials({ username, password });
    return `Logged in as "${username}"`;
  },
});

export const logOut = createLeaf({
  commandName: 'logOut',
  description: 'Log out of the alwaysAI cloud',
  options: {},
  action() {
    const credentials = readCredentials();
    if (credentials) {
      deleteCredentials();
      return `Logged out "${credentials.username}"`;
    }
    return 'Not logged in';
  },
});

export const show = createLeaf({
  commandName: 'show',
  description: 'Show currently logged in user',
  options: {},
  action() {
    const credentials = readCredentials();
    if (credentials) {
      return `Logged in as "${credentials.username}"`;
    }
    return 'Not logged in';
  },
});

export const user = createBranch({
  commandName: 'user',
  description: 'alwaysAI web user actions',
  subcommands: [logIn, logOut, show],
});
