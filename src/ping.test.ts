import { createCaughtCommandInterface } from '@alwaysai/always-cli';
import { ping } from './ping';

const caughtCommandInterface = createCaughtCommandInterface(ping);

describe(ping.commandName, () => {
  it('--help returns usage', async () => {
    expect(await caughtCommandInterface(['--help'])).toMatch(/usage/i);
  });

  it('ping returns OK', async () => {
    // TODO
  });
});
