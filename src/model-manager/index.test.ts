import { streamPackageToCache } from './stream-package-to-cache';
import { getRandomString } from '../get-random-string';
import { JsSpawner } from '../spawner/js-spawner';
import { basename } from 'path';
import tempy = require('tempy');
import { PackageStreamFromCache } from './package-stream-from-cache';
import { PackageStreamFromCwd } from './package-stream-from-cwd';

describe(__dirname, () => {
  it('downloads models from the cloud', () => {
    // TODO
  });
  it('reads and writes models locally', async () => {
    const id = `${getRandomString()}/${getRandomString()}`;
    const version = getRandomString();
    const cwd = __dirname;
    const fromCwd = await PackageStreamFromCwd(cwd);
    await streamPackageToCache({ id, version, readable: fromCwd });
    const target = JsSpawner({ path: tempy.directory() });
    const fromCache = await PackageStreamFromCache({ id, version });
    await target.untar(fromCache);
    const fileNames = await target.readdir();
    expect(fileNames).toEqual([basename(__dirname)]);
  });
});
