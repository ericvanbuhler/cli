import { testASpawner } from './test-a-spawner';
import { DockerSpawner } from './docker-spawner';

if (process.env.TEST_DOCKER_SPAWNER) {
  jest.setTimeout(15000);
  testASpawner(DockerSpawner);
}

it(DockerSpawner.name, () => {
  // See above. This is here else jest will complain "each file needs to have a test"
});
