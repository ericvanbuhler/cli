import { app } from './app';
import { config } from './config';
import { user } from './user';
import { models } from './models';
import { rpc } from './rpc';
import { model } from './model';

export const subcommands = [app, user, model, models, rpc, config];
