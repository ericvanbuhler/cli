import { run } from './run';
import { runForeground } from './run-foreground';
import { runStreaming } from './run-streaming';
import { Cmd } from '../types';

export function SpawnerBase(translate: (cmd: Cmd) => Cmd) {
  return {
    run(cmd: Cmd) {
      return run(translate(cmd));
    },
    runForeground(cmd: Cmd) {
      return runForeground(translate(cmd));
    },
    runStreaming(cmd: Cmd) {
      return runStreaming(translate(cmd));
    },
  };
}

export const spawnerBase = {
  run,
  runForeground,
  runStreaming,
};
