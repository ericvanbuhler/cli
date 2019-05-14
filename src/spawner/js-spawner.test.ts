import tempy = require('tempy');

import { JsSpawner } from './js-spawner';
import { testASpawner } from './test-a-spawner';

testASpawner(JsSpawner, { path: tempy.file() });
