import {
  createCommandInterface,
  createCaughtCommandInterface,
} from '@alwaysai/always-cli';
import { alwaysai } from '.';

const commandInterface = createCommandInterface(alwaysai);
const caughtCommandInterface = createCaughtCommandInterface(alwaysai);

describe(alwaysai.commandName, () => {
  it('shows usage', async () => {
    expect(await caughtCommandInterface(['--help'])).toMatch(/usage/i);
  });

  it('version returns version', async () => {
    const semverRegex = /\..*\..*/;
    expect(await commandInterface(['version'])).toMatch(semverRegex);
  });
});
