import { Readable } from 'stream';

export type Cmd = {
  exe: string;
  args?: string[];
  cwd?: string;
  input?: Readable;
};

export type Translate = (cmd: Cmd) => Cmd;

export type Spawner = {
  run: (cmd: Cmd) => Promise<string>;
  runForeground: (cmd: Cmd) => void;
  runStreaming: (cmd: Cmd) => Promise<Readable>;
  shell: () => void;
  abs: (...paths: string[]) => string;
  readdir: (path?: string) => Promise<string[]>;
  mkdirp: (path?: string) => Promise<void>;
  rimraf: (path?: string) => Promise<void>;
  tar: (...paths: string[]) => Promise<Readable>;
  untar: (input: Readable, cwd?: string) => Promise<void>;
};
