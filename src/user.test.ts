import {
  createCommandInterface,
  createCaughtCommandInterface,
} from '@alwaysai/always-cli';
import { user } from './user';

const commandInterface = createCommandInterface(user);
const caughtCommandInterface = createCaughtCommandInterface(user);

describe(user.commandName, () => {
  it('logIn throws "coming soon"', async () => {
    expect(await caughtCommandInterface(['logIn', '--username', 'foo'])).toMatch(
      /coming soon/i,
    );
  });

  it('show returns status', async () => {
    expect(await commandInterface(['show'])).toMatch(/not.*logged in/i);
  });
});
