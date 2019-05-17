import { createLeaf, createOneOfInput, createBranch } from '@alwaysai/alwayscli';
import * as t from 'io-ts';
import { modelConfigFile } from './model-config-file';
import keyMirror = require('keymirror');
import { inc } from 'semver';

const Level = keyMirror({
  prerelease: null,
  patch: null,
  minor: null,
  major: null,
});

export const levelCodec = t.keyof(Level);
export const LEVELS = Object.keys(Level) as (keyof typeof Level)[];

export const modelVersionIncrement = createLeaf({
  name: 'increment',
  description: 'Increment the "version" in your model config file',
  args: createOneOfInput({
    placeholder: '<level>',
    values: LEVELS,
    required: true,
  }),
  async action(level) {
    const config = modelConfigFile.read();
    const { version } = config;
    const newVersion = inc(version, level);
    modelConfigFile.update(c => {
      if (!newVersion) {
        throw new Error('Failed to increment version');
      }
      c.version = newVersion;
    });
    return newVersion;
  },
});

export const modelVersion = createBranch({
  name: 'version',
  description: 'Commands for managing the model version',
  subcommands: [modelVersionIncrement],
});
