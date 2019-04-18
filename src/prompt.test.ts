import { runAndCatch } from '@alwaysai/always-cli';

import { prompt } from './prompt';

describe(prompt.name, () => {
  it('throws "This feature is disabled" if process.stdin is not a TTY', async () => {
    if (process.stdin.isTTY) {
      const ex = await runAndCatch(prompt, []);
      expect(ex.message).toMatch(/This feature is disabled/i);
    }
  });
});
