import chalk from 'chalk';
import { createLeaf, createBranch, TerseError } from '@alwaysai/alwayscli';

import { logInUser, checkLoggedIn, logOutUser, redirectUrl } from '../../cognito-auth';
import { email, promptForEmail } from './email';
import { password, promptForPassword } from './password';
import { CodedError } from '@carnesen/coded-error';

const logIn = createLeaf({
  name: 'logIn',
  description: 'Log in to the alwaysAI Cloud',
  options: {
    email,
    password,
  },
  async action(_, opts) {
    //
    try {
      const username = await checkLoggedIn();
      if (username) {
        throw new CodedError(`Already logged in as ${chalk.bold(username)}`, 'LOGGED_IN');
      }
    } catch (err) {
      if (err.code === 'LOGGED_IN') {
        throw new TerseError(err);
      }
    }

    const email = opts.email || (await promptForEmail());
    const password = opts.password || (await promptForPassword());

    try {
      const username = await logInUser(email, password);
      return `Logged in as ${chalk.bold(username)}`;
    } catch (err) {
      switch (err.code) {
        case 'NEW_PASSWORD_REQUIRED': {
          throw new TerseError(
            `Password reset required. Please visit ${chalk.bold(
              redirectUrl,
            )} to reset your password`,
          );
        }
        case 'UserNotConfirmedException': {
          throw new TerseError(
            'Account not confirmed. Please check your inbox and follow instructions to confirm your account',
          );
        }
        case 'PasswordResetRequiredException': {
          throw new TerseError(
            `Password reset required. Please visit ${redirectUrl} to reset your password`,
          );
        }
        case 'NotAuthorizedException':
        case 'UserNotFoundException': {
          throw new TerseError('Invalid Username/Password combination.');
        }

        default: {
          throw new TerseError('An error occured');
        }
      }
    }
  },
});

const logOut = createLeaf({
  name: 'logOut',
  description: 'Log out of the alwaysAI Cloud',
  options: {},
  async action() {
    try {
      await logOutUser();
      return 'Logged out successfully';
    } catch {
      return 'An error occurred logging out';
    }
  },
});

const show = createLeaf({
  name: 'show',
  description: 'Show the currently logged in user',
  options: {},
  async action() {
    try {
      const username = await checkLoggedIn();
      return `Logged in as "${username}"`;
    } catch {
      return 'Not logged in';
    }
  },
});

export const user = createBranch({
  name: 'user',
  description: 'Log in or log out of the alwaysAI cloud',
  subcommands: [logIn, logOut, show],
});
