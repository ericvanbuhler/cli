import { alwaysai } from '..';

it('version returns a semver string', async () => {
  const semverRegex = /\..*\..*/;
  expect(await alwaysai('version')).toMatch(semverRegex);
});
