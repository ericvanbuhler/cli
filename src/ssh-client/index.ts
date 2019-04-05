import { Client as Ssh2Client, ClientChannel } from 'ssh2';
import { Readable } from 'stream';

import { CodedError } from '@carnesen/coded-error';
import { readFile } from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import { homedir, userInfo } from 'os';
import { TerseError } from '@alwaysai/always-cli';

type Config = Partial<{
  hostname: string;
  port: number;
  username: string;
  privateKey: string;
  password: string;
}>;

type ExecResult = {
  stdout: string;
  stderr: string;
  code: number;
};

const DOT_SSH_DIR = join(homedir(), '.ssh');

async function readDefaultPrivateKey() {
  try {
    return await promisify(readFile)(join(DOT_SSH_DIR, 'id_rsa'), {
      encoding: 'utf8',
    });
  } catch (ex) {
    if (ex.code !== 'ENOENT') {
      throw ex;
    }
    return undefined;
  }
}

export class SshClient {
  private readonly ssh2 = new Ssh2Client();
  private readonly config: Config;

  public constructor(config: Config = {}) {
    this.config = config;
  }

  public async connect() {
    const { hostname, username, password, privateKey, port = 22 } = this.config;
    let defaultPrivateKey: string | undefined;
    if (!privateKey && !password) {
      defaultPrivateKey = await readDefaultPrivateKey();
    }
    await new Promise((resolve, reject) => {
      this.ssh2.on('ready', () => {
        resolve();
      });
      this.ssh2.on('error', reject);
      this.ssh2.connect({
        host: hostname,
        port,
        privateKey: privateKey || defaultPrivateKey,
        username: username || userInfo().username,
        password,
      });
    });
  }

  public async shell(opts: { cwd?: string } = {}) {
    if (!process.stdout.isTTY) {
      throw new TerseError('Node.js is not currently being run in a text terminal "TTY"');
    }
    return new Promise<ClientChannel>((resolve, reject) => {
      const ready = this.ssh2.shell({ term: 'xterm-256color' }, (err, channel) => {
        if (!ready) {
          return reject(new Error(`SSH server is not ready`));
        }
        if (err) {
          return reject(err);
        }
        channel.stderr.pipe(process.stderr);
        channel.on('close', (code: any) => {
          if (code !== 0 && code !== 127) {
            const message = `Channel exited with code ${code}`;
            reject(new CodedError(message, code));
          }
          resolve();
        });
        if (opts.cwd) {
          channel.write(`cd '${opts.cwd}'\n`);
        }
        process.stdin.pipe(channel);
        channel.stdout.pipe(process.stdout);
      });
    });
  }

  public runCommand(command: string, input?: Readable) {
    return new Promise<ExecResult>((resolve, reject) => {
      this.ssh2.exec(command, (err, channel) => {
        if (err) {
          reject(err);
          return;
        }
        if (input) {
          input.pipe(channel);
        }
        const resolvedValue: Partial<ExecResult> = {
          stdout: '',
          stderr: '',
        };

        channel.on('close', (code: any) => {
          if (code !== 0) {
            const message = `Remote command "${command}" exited with code ${code}`;
            throw new CodedError(message, code, resolvedValue);
          }
          resolvedValue.code = code;
          resolve(resolvedValue as ExecResult);
        });

        channel.on('data', (chunk: any) => {
          resolvedValue.stdout = resolvedValue.stdout + chunk;
        });

        channel.stderr.on('data', (chunk: any) => {
          resolvedValue.stderr = resolvedValue.stderr + chunk;
        });
      });
    });
  }

  public runCommand2(command: string) {
    return new Promise<void>((resolve, reject) => {
      this.ssh2.exec(command, { pty: true }, (err, channel) => {
        if (err) {
          reject(err);
          return;
        }

        channel.on('close', (code: any) => {
          if (code !== 0) {
            const message = `Remote command "${command}" exited with code ${code}`;
            reject(new CodedError(message, code));
          } else {
            resolve();
          }
        });
        channel.stdout.pipe(process.stdout);
        channel.stderr.pipe(process.stderr);
      });
    });
  }

  public async mkdirp(path: string) {
    try {
      await this.runCommand(`mkdir -p "${path}"`);
    } catch (ex) {
      // TODO: Better error
      throw ex;
    }
  }

  public async unPackage(destination: string, packageStream: Readable) {
    await this.mkdirp(destination);
    await this.runCommand(`cd ${destination} && tar xvfz -`, packageStream);
  }
}
