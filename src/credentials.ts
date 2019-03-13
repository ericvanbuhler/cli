import { homedir } from 'os';
import { join, dirname } from 'path';
import mkdirp = require('mkdirp');
import { writeFileSync, renameSync, readFileSync, unlinkSync } from 'fs';
import { FatalError } from '@alwaysai/always-cli';

const CONFIG_DIR = join(homedir(), '.config', 'alwaysai');

function toAbsolute(fileName: string) {
  return join(CONFIG_DIR, fileName);
}

function writeFileCarefully(filePath: string, fileContents: any) {
  const tmpFilePath = `${filePath}.tmp`;
  mkdirp.sync(dirname(tmpFilePath));
  writeFileSync(tmpFilePath, fileContents);
  renameSync(tmpFilePath, filePath);
}

type Credentials = { username: string; password: string };
const CREDENTIALS_FILE_PATH = toAbsolute('credentials.json');

export function writeCredentials({ username, password }: Credentials) {
  const data = {
    username,
    password,
  };
  const serialized = JSON.stringify(data, null, 2);
  writeFileCarefully(CREDENTIALS_FILE_PATH, serialized);
}

export function deleteCredentials() {
  unlinkSync(CREDENTIALS_FILE_PATH);
}

export function readCredentials() {
  try {
    const fileContents = readFileSync(CREDENTIALS_FILE_PATH, 'utf8');
    const { username, password } = JSON.parse(fileContents);
    const credentials: Credentials = {
      username,
      password,
    };
    return credentials;
  } catch (ex) {
    if (ex.code === 'ENOENT') {
      return null;
    }
    throw ex;
  }
}

export function checkLoggedIn() {
  const credentials = readCredentials();
  if (!credentials) {
    throw new FatalError(
      'You must be logged in for this action. Please run "alwaysai user logIn".',
    );
  }
  return credentials;
}
