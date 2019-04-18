import { prompt } from './prompt';
import { runAndCatch } from '@alwaysai/always-cli';

describe(prompt.name, () => {
  it('throws "This feature is disabled" if process.stdin is not a TTY', async () => {
    const ex = await runAndCatch(prompt, []);
    expect(ex.message).toMatch(/This feature is disabled/i);
  });
});
