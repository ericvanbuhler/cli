import { createTarbombStream } from './create-tarbomb-stream';
import * as tempy from 'tempy';
import { writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';

describe(createTarbombStream.name, () => {
  it(`creates a readable stream of tarred & gzipped contents of the specified directory`, async () => {
    const sourceDir = tempy.directory();
    writeFileSync(join(sourceDir, '.git'), 'foo');
    writeFileSync(join(sourceDir, 'app.py'), 'bar');
    const subject = createTarbombStream(sourceDir);
    const buffers: Buffer[] = [];
    subject.on('data', chunk => {
      buffers.push(chunk);
    });
    const buffer = await new Promise<Buffer>(resolve => {
      subject.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
    });

    const targetDir = tempy.directory();
    spawnSync('tar', ['xvfz', '-'], {
      cwd: targetDir,
      input: buffer,
    });
    expect(readdirSync(targetDir)).toEqual(['app.py']);
  });

  it('throws "has no non-ignored content" if the directory is empty', () => {
    expect(() => createTarbombStream(tempy.directory())).toThrow(
      /has no non-ignored content/i,
    );
  });
});
