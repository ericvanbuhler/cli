import { runAndCatch } from '@alwaysai/alwayscli';

import { alwaysai } from '..';

describe('index file', () => {
  it('shows usage', async () => {
    expect(await runAndCatch(alwaysai, '--help')).toMatch(/usage/i);
  });
});
