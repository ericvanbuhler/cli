import chalk from 'chalk';
import { createLeaf, createBranch, TerseError } from '@alwaysai/alwayscli';

import { credentialsStore } from '../../credentials-store';
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
    if (!opts.password) {
      await promptForPassword();
    }
    const idToken =
      'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY1NmMzZGQyMWQwZmVmODgyZTA5ZTBkODY5MWNhNWM3ZjJiMGQ2MjEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2Fsd2F5c2FpLWRldiIsImF1ZCI6ImFsd2F5c2FpLWRldiIsImF1dGhfdGltZSI6MTU1NjY0MjcxMCwidXNlcl9pZCI6IjU4NTgyYmFhLWEzMGUtNDZjOC05ZjVjLWJlZTBhMGVlMGY0YSIsInN1YiI6IjU4NTgyYmFhLWEzMGUtNDZjOC05ZjVjLWJlZTBhMGVlMGY0YSIsImlhdCI6MTU1NjY0MjcxMCwiZXhwIjoxNTU2NjQ2MzEwLCJlbWFpbCI6ImNocmlzLmFybmVzZW5AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsiY2hyaXMuYXJuZXNlbkBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.BnvaQyUQL7_rq9-U85lXUF8t255Z0RQ1hvESUNpnoG-LnAl70m1FfShGyRyv0_njVSFZo8gyz16LxMO-K_hdWeG9oTKzKiUADprHDA04LQt1K4ovsQs3MsEGAtrmOt0zZwn79vZcnO29MJRR7IO5OE4EeDpa1fmbjeJ4uuE12Qh2xOXM15UNskQe-slvHXwg7vSvCGXcYAoA1LV0LCmc8c80m112jBQajksWwXI-J4UzKQzVWMuZJ9wrDYGGSrCJ0ODFxRliuhdpKEtR5t9FmwrjQJ_mCngHFbO1vs96rVwQ_tHBb3X7_nf7mPTfMCKQuZsVEVVb4lrP37fPD3P9Bg';
    credentialsStore.write({
      email,
      idToken,
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
