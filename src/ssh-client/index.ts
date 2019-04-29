import { Client as Ssh2Client, ClientChannel } from 'ssh2';
import { Readable } from 'stream';

import { CodedError } from '@carnesen/coded-error';
import { readFile } from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import { homedir, userInfo } from 'os';
import { checkTerminalIsInteractive } from '../prompt';

const REMOTE_COMMAND_FAILED = 'REMOTE_COMMAND_FAILED';

type DefaultConfig = {
  port: number;
  username: string;
  privateKeyPath: string;
};

export const SSH_DEFAULT: DefaultConfig = {
  port: 22,
  username: userInfo().username,
  privateKeyPath: join(homedir(), '.ssh', 'id_rsa'),
};

type Config = {
  hostname: string;
  path: string;
  password?: string;
} & Partial<DefaultConfig>;

type ExecResult = {
  stdout: string;
  stderr: string;
  code: number;
};

export class SshClient {
  private readonly ssh2 = new Ssh2Client();
  private readonly config: Config;

  public constructor(config: Config) {
    this.config = config;
  }

  public async connect() {
    let privateKey: string | undefined;
    try {
      privateKey = await promisify(readFile)(
        this.config.privateKeyPath || SSH_DEFAULT.privateKeyPath,
        {
          encoding: 'utf8',
        },
      );
    } catch (ex) {
      if (ex.code !== 'ENOENT') {
        throw ex;
      }
    }
    await new Promise((resolve, reject) => {
      this.ssh2.on('ready', () => {
        resolve();
      });
      this.ssh2.on('error', reject);
      this.ssh2.connect({
        host: this.config.hostname,
        port: this.config.port || SSH_DEFAULT.port,
        privateKey,
        username: this.config.username || SSH_DEFAULT.username,
        password: this.config.password,
      });
    });
  }

  public async mkdirp() {
    try {
      await this.runCommand(`mkdir -p "${this.config.path}"`, { skipCd: true });
    } catch (ex) {
      if (ex && ex.code === REMOTE_COMMAND_FAILED && ex.data) {
        const { stderr } = ex.data;
        if (stderr && typeof stderr === 'string') {
          throw new Error(stderr);
        }
      }
      throw ex;
    }
  }

  public async shell() {
    return new Promise<ClientChannel>((resolve, reject) => {
      checkTerminalIsInteractive();
      process.stdin.setRawMode!(true);
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
        channel.write(`cd '${this.config.path}'\n`);
        process.stdin.pipe(channel);
        channel.stdout.pipe(process.stdout);
      });
    });
  }

  private get cdCommand() {
    return `cd "${this.config.path}"`;
  }

  public runCommand(
    command: string,
    opts: Partial<{ input: Readable; skipCd: boolean }> = {},
  ) {
    return new Promise<ExecResult>((resolve, reject) => {
      const fullCommand = opts.skipCd ? command : `${this.cdCommand} && ${command}`;
      this.ssh2.exec(fullCommand, (err, channel) => {
        if (err) {
          reject(err);
          return;
        }
        if (opts.input) {
          opts.input.pipe(channel);
        }
        const resolvedValue: Partial<ExecResult> = {
          stdout: '',
          stderr: '',
        };

        channel.on('close', (code: any) => {
          if (code !== 0) {
            const message = `Remote command "${command}" exited with code ${code}`;
            reject(new CodedError(message, REMOTE_COMMAND_FAILED, resolvedValue));
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
      this.ssh2.exec(`${this.cdCommand} && ${command}`, { pty: true }, (err, channel) => {
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
}
