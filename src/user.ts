import { createBranch, createLeaf } from '@alwaysai/always-cli';
import { username } from './username';

export const logIn = createLeaf({
  commandName: 'logIn',
  description: 'Log in to the alwaysAI cloud',
  options: {
    username,
  },
  action({ username }) {
    if (!username) {
      throw new Error('foo');
    }
    throw 'TODO: Coming soon ...';
  },
});

export const show = createLeaf({
  commandName: 'show',
  description: 'Show currently logged in user',
  options: {},
  action() {
    return 'Not currently logged in';
  },
});

export const user = createBranch({
  commandName: 'user',
  description: 'alwaysAI web user actions',
  subcommands: [logIn, show],
});
