import { runAndCatch } from '@alwaysai/always-cli';

import { alwaysai } from '..';

describe('index file', () => {
  it('shows usage', async () => {
    expect(await runAndCatch(alwaysai, '--help')).toMatch(/usage/i);
  });
});
