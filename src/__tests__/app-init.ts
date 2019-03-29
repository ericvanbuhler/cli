import * as tempy from 'tempy';
import { alwaysai } from '..';
import { basename } from 'path';

describe('app init', () => {
  it('happy path', async () => {
    const dir = tempy.directory();
    process.chdir(dir);
    await alwaysai('user', 'logIn', '--username', 'alwaysai', '--password', 'alwaysai');
    await alwaysai('app', 'init', '--yes');
    const config = await alwaysai('app', 'show');
    expect(config.publisher).toBe('alwaysai');
    expect(config.name).toBe(basename(dir));
    expect(config.models).toEqual({});
    expect(config.scripts).toEqual({ start: 'python app.py' });
  });
});
