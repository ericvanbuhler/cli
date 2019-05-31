import chalk from 'chalk';
import logSymbols = require('log-symbols');
import { createLeaf, TerseError } from '@alwaysai/alwayscli';

import { getCurrentUser, CognitoAuth } from '../../cognito-auth';
import { email, promptForEmail } from '../../inputs/email';
import { password, promptForPassword } from '../../inputs/password';
import { webAuthUrl } from '../../config';
import { echo } from '../../echo';
import { getNonInteractiveStreamName, prompt } from '../../prompt';
import { yes } from '../../inputs/yes';

export const userLogin = createLeaf({
  name: 'login',
  description: 'Log in to the alwaysAI Cloud',
  options: {
    email,
    password,
    yes,
  },
  async action(_, opts) {
    let user = await getCurrentUser();
    if (user) {
      throw new TerseError(`Already logged in as ${chalk.bold(user.getUsername())}`);
    }

    const email = opts.email || (await promptForEmail());
    const password = opts.password || (await promptForPassword());

    try {
      user = await CognitoAuth.signIn(email, password);
    } catch (err) {
      switch (err.code) {
        case 'UserNotConfirmedException': {
          throw new TerseError(
            'Account not confirmed. Please check your inbox and follow instructions to confirm your account',
          );
        }

        case 'PasswordResetRequiredException': {
          echo(`Please visit the following URL in a web browser to reset your password:`);
          echo();
          echo(chalk.bold(webAuthUrl));
          echo();
          throw new TerseError('Unable to proceed until password is reset');
        }

        case 'NotAuthorizedException': {
          echo(`${logSymbols.error} Incorrect password for ${chalk.bold(email)}`);
          echo();
          echo('Please try again or visit the following URL to reset your password:');
          echo();
          echo(chalk.bold(webAuthUrl));
          echo();
          throw new TerseError('Authentication failed');
        }
        case 'UserNotFoundException': {
          throw new TerseError(`User not found for email ${chalk.bold(email)}`);
        }

        default: {
          throw err;
        }
      }
    }

    if (!user) {
      throw new Error('Failed to instantiate user object');
    }
    // At this point we have confirmed the user's username and password, but she may have additional "challenges"
    switch (user.challengeName) {
      case undefined:
      case '':
        break;
      case 'NEW_PASSWORD_REQUIRED': {
        echo(`${logSymbols.warning} Change your password`);
        if (getNonInteractiveStreamName()) {
          throw new TerseError(
            'Please re-run this command in an interactive shell so we can prompt for your new password',
          );
        }
        if (opts.yes) {
          throw new TerseError(
            'Please re-run this command without the --yes flag so we can prompt for your new password',
          );
        }
        const answer0 = await prompt([
          {
            type: 'password',
            name: 'password',
            message: 'New password',
            validate: value =>
              value.length >= 8 || 'Password must be at least 8 characters',
          },
        ]);
        await prompt([
          {
            type: 'password',
            name: 'password',
            message: 'New password (again)',
            validate: value => value === answer0.password || 'New passwords do not match',
          },
        ]);

        // Workaround https://github.com/aws-amplify/amplify-js/blob/45b79f24371de398e36be2770a35aad128ba6ca3/packages/amazon-cognito-identity-js/src/CognitoUser.js#L501
        (global as any).navigator = {
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
        };
        await CognitoAuth.completeNewPassword(user, answer0.password, { email });
        break;
      }
      default: {
        throw new TerseError(`Unexpected challenge "${user.challengeName}"`);
      }
    }
    return `Logged in as ${chalk.bold(user.getUsername())}`;
  },
});
