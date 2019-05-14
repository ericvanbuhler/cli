import { join, isAbsolute } from 'path';

import { Spawner } from './types';
import { getRandomString } from '../get-random-string';

type SpawnerFactory<T extends any[]> = (...args: T) => Spawner;

export function testASpawner<T extends any[]>(factory: SpawnerFactory<T>, ...args: T) {
  const spawner = factory(...args);
  const { abs, mkdirp, rimraf, run, readdir, runForeground, tar, untar } = spawner;
  async function exists(path?: string) {
    try {
      await readdir(path);
    } catch (ex) {
      if (ex.code === 'ENOENT') {
        return false;
      }
      throw ex;
    }
    return true;
  }

  describe(factory.name, () => {
    describe(abs.name, () => {
      it('returns the absolute context path of the spawner if no args are passed', () => {
        const contextPath = abs();
        expect(isAbsolute(contextPath)).toBe(true);
      });

      it('resolves a context-path-relative paths to ab absolute one', () => {
        const contextPath = abs();
        const path = abs('foo');
        expect(path).toBe(join(contextPath, 'foo'));
      });

      it('resolves absolute paths to themselves', () => {
        const path = abs('/foo');
        expect(path).toBe('/foo');
      });

      it('acts like path.resolve (i.e. `cd x && cd y && cd z`) for multiple paths', () => {
        const path = abs('foo', '/bar', 'baz');
        expect(path).toBe('/bar/baz');
      });
    });

    describe(mkdirp.name, () => {
      it('makes the context path directory if no args are provided', async () => {
        await spawner.mkdirp();
        expect(await exists(abs())).toBe(true);
      });

      it('makes a context-path-relative directory if one is provided', async () => {
        const tmpId = getRandomString();
        await spawner.mkdirp(tmpId);
        expect(await exists(join(abs(), tmpId))).toBe(true);
      });

      it('makes an absolute path if one is provided', async () => {
        const tmpId = getRandomString();
        const tmpDir = abs(tmpId);
        expect(await exists(tmpDir)).toBe(false);
        await spawner.mkdirp(tmpDir);
        expect(await exists(tmpDir)).toBe(true);
      });
    });

    describe(rimraf.name, () => {
      it('removes an abs-relative directory if one is provided', async () => {
        const tmpId = getRandomString();
        await spawner.mkdirp(tmpId);
        expect(await exists(join(abs(), tmpId))).toBe(true);
        await spawner.rimraf(tmpId);
        expect(await exists(join(abs(), tmpId))).toBe(false);
      });

      it('removes an absolute path if one is provided', async () => {
        const tmpId = getRandomString();
        const tmpDir = abs(tmpId);
        expect(await exists(tmpDir)).toBe(false);
        await spawner.mkdirp(tmpDir);
        expect(await exists(tmpDir)).toBe(true);
      });
    });

    describe(readdir.name, () => {
      it('reads files and dot file names in a context-path-relative path if one is provided', async () => {
        await mkdirp('foo');
        await run({ exe: 'touch', args: ['foo/a'], cwd: '.' });
        expect(await readdir('foo')).toEqual(['a']);
      });

      it('reads files and dot file names in an absolute path if one is provided', async () => {
        expect((await readdir('/')).length > 0).toBe(true);
      });
    });

    describe(runForeground.name, () => {
      it('runs a command synchronously with inherited I/O', async () => {
        const tmpDir = await run({ exe: 'mktemp', args: ['-d'] });
        runForeground({ exe: 'ls', cwd: tmpDir });
      });
    });

    describe(`${tar.name} and ${untar.name}`, () => {
      it('does tarring and untarring', async () => {
        const tmpDir0 = getRandomString();
        const tmpDir1 = getRandomString();
        await mkdirp(tmpDir0);
        await mkdirp(tmpDir1);
        await run({ exe: 'touch', args: ['foo'], cwd: tmpDir0 });
        const stream = await tar(tmpDir0);
        await untar(stream, tmpDir1);
        const fileNames = await readdir(tmpDir1);
        expect(fileNames).toEqual([tmpDir0]);
      });
    });
  });
}
