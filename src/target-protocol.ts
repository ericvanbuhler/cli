import * as t from 'io-ts';
import keyMirror = require('keymirror');

export const TargetProtocol = keyMirror({
  'ssh:': null,
  'docker:': null,
  'ssh+docker:': null,
});

export type TargetProtocol = keyof typeof TargetProtocol;
export const targetProtocol = t.keyof(TargetProtocol);
export const TARGET_PROTOCOLS = Object.keys(TargetProtocol) as TargetProtocol[];
