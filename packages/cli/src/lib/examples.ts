import { colors, OrigamiError } from '@origami/core';
// tslint:disable-next-line match-default-export-name
import cli from 'cli-ux';
import execa from 'execa';
import extract from 'extract-zip';
import fs from 'fs-extra';
import { NOT_FOUND, OK } from 'http-status-codes';
import Listr from 'listr';
import path from 'path';
import request from 'request';
// tslint:disable-next-line match-default-export-name
import requestP from 'request-promise-native';
import tmp from 'tmp';
import { run, setup } from '../listr-tasks';
import { spinner } from './spinner';


class ErrorExampleNoExamples extends OrigamiError {
  public showTrace = false;
  constructor() {
    super('CLI', 'ExampleNoExamples', 'Could not find any examples');
  }
}

class ErrorExampleNotFound extends OrigamiError {
  constructor(example: string) {
    super('CLI', 'ExampleNotFound', `Example '${colors.yellow(example)}' could not be found`);
    this.showTrace = false;
  }
}


type Items = {
  description: string;
  name: string;
  html_url: string;
}[];


export const REPO = (repo: string) =>
  `https://api.github.com/repos/origami-cms/example-${repo}/zipball/master`;

export const SEARCH_EXAMPLES =
  'https://api.github.com/search/repositories?q=origami-cms/origami-example-';

export const REQUEST_HEADERS = {
  'accept-language': 'en-US,en;q=0.8',
  // tslint:disable-next-line max-line-length
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2',
};


export const fetchAll = async (log: boolean = true): Promise<Items> => {

  spinner.start(colors.grey('Fetching examples'));

  // tslint:disable-next-line await-promise
  const res = await requestP({
    url: SEARCH_EXAMPLES,
    headers: REQUEST_HEADERS
  });

  spinner.clear();
  spinner.stop();

  let items: Items;

  try {
    items = JSON.parse(res).items;
  } catch (e) {
    throw new ErrorExampleNoExamples();
  }

  if (log) {
    cli.log('\nOrigami examples:\n');
    items.forEach((i) => {
      cli.log(
        colors.purple(`- ${i.name.split('example-').pop()!}`),
        colors.white(`\t${i.description}`),
        colors.blue(`\n\t\t${i.html_url}\n`)
      );
    });
  }

  return items;
};


export const clone = async (ex: string): Promise<boolean | string> => {
  const directory = path.join(process.cwd(), ex);

  return new Listr([
    {
      title: 'Preparing',
      task: async (ctx) => ctx.file = tmp.fileSync({})
    },
    {
      title: `Downloading example to ./${ex}`,
      task: async (ctx) => download(ex, ctx.file.name),
    },
    {
      title: 'Extracting',
      task: async (ctx) => extractRepo(ctx.file.name, ctx.directory),
    },
    setup.installDependenciesYarn(),
    setup.installDependenciesNPM(),
    run.origami()
  ]).run({directory, open: true});
};


export const download = async (example: string, file: string) =>
  new Promise((res, rej) => {
    const headers = {
      ...REQUEST_HEADERS,
      ...{
        'accept-charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-encoding': 'gzip,deflate'
      }
    };

    const options = {
      url: REPO(example),
      headers
    };

    let ok = true;
    request(options, (err: NodeJS.ErrnoException) => {
      if (err) rej(err);
      else res(ok);
    })
      .on('response', (r) => {
        if (r.statusCode === NOT_FOUND) throw new ErrorExampleNotFound(example);
        if (r.statusCode !== OK) ok = false;
      })
      .pipe(fs.createWriteStream(file));
  });


export const extractRepo = async (zip: string, dest: string) =>
  new Promise((res, rej) => {
    tmp.dir(async (err: Error, dir: string) => {
      if (err) {
        rej(err);
        return;
      }
      extract(zip, { dir }, async () => {
        const [repo] = fs.readdirSync(dir);

        await fs.copy(path.join(dir, repo), dest);
        res();
      });
    });
  });
