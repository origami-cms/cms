import execa from 'execa';
import path from 'path';
import { success, info, colors } from '@origami/core-lib';

const [,,tag] = process.argv;


// Loops over all packages, and syncs the versions to the LOCAL latest version
const publish = async () => {
  const {stdout} = await execa('npx', ['lerna', 'list', '--long']);
  const packages = stdout.split('\n').map(p => {
    const [,name, version, dir] = /^([^\s]+)\s+v([^\s]+)\s(.*)$/.exec(p)!;
    return {name, version, dir};
  });

  packages.forEach(async (p) => {
    info(colors.blue(`🚀 Publishing ${colors.yellow(p.name)} at version ${colors.yellow.bold(p.version)} ${tag ? `🏷 ${tag}` : ''}`));
    const tagFlag = tag ? ['--tag', tag] : [];
    await execa(
      'yarn', ['publish', '--non-interactive', `--new-version=${p.version}`, ...tagFlag],
      {cwd: path.join(__dirname, '../', p.dir)}
    );
    success('Success!');
  });
};

publish();
