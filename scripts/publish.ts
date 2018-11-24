import execa from 'execa';
import path from 'path';

// Loops over all packages, and syncs the versions to the LOCAL latest version
const publish = async () => {
  const {stdout} = await execa('npx', ['lerna', 'list', '--long']);
  const packages = stdout.split('\n').map(p => {
    const [,name, version, dir] = /^([^\s]+)\s+v([^\s]+)\s(.*)$/.exec(p)!;
    return {name, version, dir};
  });

  packages.forEach(async (p) => {
    console.log('Publishing', p.name, '@', p.version);
    await execa(
      'yarn', ['publish', '--non-interactive', `--new-version=${p.version}`],
      {cwd: path.join(__dirname, '../', p.dir)}
    );
    console.log('Success!');
  });
};

publish();
