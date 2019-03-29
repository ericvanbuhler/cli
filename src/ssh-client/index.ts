import { Client as Ssh2Client } from 'ssh2';
import { Readable } from 'stream';

import { CodedError } from '@carnesen/coded-error';
import { readFile } from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import { homedir } from 'os';

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
    const {
      hostname = 'localhost',
      username = 'alwaysai',
      password = 'alwaysai',
      privateKey,
      port = 22,
    } = this.config;
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
        username,
        password,
      });
    });
  }

  public async unPackage(destination: string, packageStream: Readable) {
    const command = `mkdir -p "${destination}" && cd ${destination} && tar xvfz -`;
    await this.runCommand(command, packageStream);
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
          this.ssh2.end();
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
}
