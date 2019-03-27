import { Client as Ssh2Client } from 'ssh2';
import { Readable } from 'stream';

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

export class SshClient {
  private readonly ssh2 = new Ssh2Client();
  private readonly config: Config;

  public constructor(config: Config = {}) {
    this.config = config;
  }

  public async connect() {
    await new Promise((resolve, reject) => {
      this.ssh2.on('ready', () => {
        resolve();
      });
      this.ssh2.on('error', reject);
      const {
        hostname = 'localhost',
        username = 'alwaysai',
        password,
        privateKey,
        port = 22,
      } = this.config;
      this.ssh2.connect({
        host: hostname,
        port,
        privateKey,
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
