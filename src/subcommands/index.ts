import { app } from './app';
import { config } from './config';
import { user } from './user';
import { version } from './version';
import { models } from './models';
import { rpc } from './rpc';

export const subcommands = [app, user, models, rpc, config, version];
