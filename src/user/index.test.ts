import {
  createCommandInterface,
  createCaughtCommandInterface,
} from '@alwaysai/always-cli';
import { user } from '.';

const commandInterface = createCommandInterface(user);
const caughtCommandInterface = createCaughtCommandInterface(user);

describe(user.commandName, () => {
  it('shows usage', async () => {
    expect(await caughtCommandInterface(['--help'])).toMatch(/usage/i);
  });

  it('show returns status', async () => {
    expect(await commandInterface(['show'])).toMatch(/.*/i);
  });
});
