import { spawn } from 'child_process';
import signalExit = require('signal-exit');
import chalk from 'chalk';

import { TerseError } from '@alwaysai/alwayscli';

import { Cmd } from '../types';

export async function run(cmd: Cmd) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(cmd.exe, cmd.args || [], { cwd: cmd.cwd });
    signalExit(() => {
      child.kill();
    });

    if (cmd.input) {
      cmd.input.pipe(child.stdin);
    }

    // TODO: Limit buffer size
    const outChunks: Buffer[] = [];
    const allChunks: Buffer[] = []; // stderr and stdout

    child.stdout.on('data', chunk => {
      outChunks.push(chunk);
      allChunks.push(chunk);
    });

    child.stderr.on('data', chunk => {
      allChunks.push(chunk);
    });

    child.on('error', err => {
      reject(err);
    });

    child.on('close', code => {
      if (code === 0) {
        const str = Buffer.concat(outChunks).toString('utf8');
        if (str.endsWith('\n')) {
          resolve(str.slice(0, -1));
        } else {
          resolve(str);
        }
      } else {
        let message = `Process exited with non-zero status code ${chalk.bold(
          code.toString(),
        )}`;
        message += '\n\n';
        message += `$ ${cmd.exe} ${cmd.args ? cmd.args.join(' ') : ''}`;
        message += '\n\n';
        message += Buffer.concat(allChunks).toString('utf8');
        reject(new TerseError(message));
      }
    });
  });
}
