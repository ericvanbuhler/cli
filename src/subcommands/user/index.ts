import chalk from 'chalk';
import { createLeaf, createBranch, TerseError } from '@alwaysai/always-cli';

import { credentialsStore } from '../../credentials-store';
import { firebaseAuth } from '../../firebase-auth';
import { email, promptForEmail } from './email';
import { password, promptForPassword } from './password';

const logIn = createLeaf({
  name: 'logIn',
  description: 'Log in to the alwaysAI Cloud',
  options: {
    email,
    password,
  },
  async action(_, opts) {
    const credentials = credentialsStore.readIfExists();
    if (credentials) {
      throw new TerseError(`Already logged in as ${chalk.bold(credentials.email)}`);
    }
    const email = opts.email || (await promptForEmail());
    const password = opts.password || (await promptForPassword());
    const { user } = await firebaseAuth.signInWithEmailAndPassword(email, password);
    if (!user) {
      throw new Error('Expected "user"');
    }
    const idToken = await user.getIdToken();
    credentialsStore.write({
      email,
      idToken,
      password,
    });
    return `Logged in as ${chalk.bold(email)}`;
  },
});

const logOut = createLeaf({
  name: 'logOut',
  description: 'Log out of the alwaysAI Cloud',
  options: {},
  action() {
    const credentials = credentialsStore.readIfExists();
    if (credentials) {
      credentialsStore.remove();
      return `Logged out ${chalk.bold(credentials.email)}`;
    }
    return 'Not logged in';
  },
});

const show = createLeaf({
  name: 'show',
  description: 'Show the currently logged in user',
  options: {},
  action() {
    if (credentialsStore.exists()) {
      const credentials = credentialsStore.read();
      return `Logged in as "${credentials.email}"`;
    }
    return 'Not logged in';
  },
});

export const user = createBranch({
  name: 'user',
  description: 'Log in or log out of the alwaysAI cloud',
  subcommands: [logIn, logOut, show],
});
