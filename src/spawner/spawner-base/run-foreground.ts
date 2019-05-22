import { spawnSync } from 'child_process';

import { Cmd } from '../types';

export function runForeground(cmd: Cmd) {
  console.log(cmd)
  const out = spawnSync(cmd.exe, cmd.args || [], {
    cwd: cmd.cwd,
    stdio: 'inherit',
  });
  if (out.error) {
    throw out.error;
  }
}
