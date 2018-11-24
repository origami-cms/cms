import { Origami } from '@origami/core-lib';
// tslint:disable-next-line match-default-export-name
import request from 'request-promise-native';
// @ts-ignore
// tslint:disable-next-line
const npm = require('npm-programmatic');

/**
 * Get's a list of origami modules with a specific type
 * @param type Type of module to find
 */
export const list = (type: Origami.ModuleType) => {
  let reg: RegExp | null = null;
  if (type) reg = new RegExp(`origami-${type}`);

  let _list: string[] = npm.list(process.cwd());
  _list = _list
    .filter((p) => !p.endsWith('extraneous'))
    .map((p) => {
      const res = (/^(.*)@.+$/).exec(p);
      return res ? res[1] : false;
    })
    .filter((p) => p !== false) as string[];

  if (!reg) return _list;
  return _list.filter((p) => (reg as RegExp).test(p));
};


export interface NPMSearchResults {
  total: number;
  results: NPMSearchResult[];
}

export interface NPMSearchResult {
  package: {
    name: string;
    scope: string;
    version: string;
    description: string;
    date: string;
    links: {
      npm: string;
      homepage: string;
      repository: string;
      bugs: string;
    };
    author: {
      name: string;
      email: string;
      username: string;
    };
    publisher: {
      username: string;
      email: string;
    };
    maintainers: [
      {
        username: string;
        email: string;
      }
    ];
  };
  flags: {
    unstable: boolean;
  };
  score: {
    final: number;
    detail: {
      quality: number;
      popularity: number;
      maintenance: number;
    };
  };
  searchScore: number;
}

// Searches api.npms.io
export const search = async (type = '') => {
  let reg: RegExp | null = null;
  if (type) reg = new RegExp(`origami-${type}`);

  const { results: _list } = JSON.parse(
    // tslint:disable-next-line await-promise
    await request(`https://api.npms.io/v2/search?q=origami-${type}-`)
  ) as NPMSearchResults;

  const simple = _list.map((p) => p.package);

  if (!reg) return simple;
  return simple.filter((p: { name: string }) => (reg as RegExp).test(p.name));
};

