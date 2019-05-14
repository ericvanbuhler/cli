import tempy = require('tempy');

import { testASpawner } from './test-a-spawner';
import { ChildSpawner } from './child-spawner';

testASpawner(ChildSpawner, { path: tempy.file() });
