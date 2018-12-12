import { Origami, PackageJson, pkgjson, random } from '@origami/core';
import { object as dotObj } from 'dot-object';
// tslint:disable-next-line match-default-export-name
import inq from 'inquirer';
import * as _ from 'lodash';
import { defaultData } from './defaultData';


const defaultConfig = async (name?: string) => {
  const _name = (name || process.cwd()).split('/').pop();
  return {
    app: {
      name: _name
    },
    server: {
      port: 9999,
      secret: await random()
    },
    store: {
      host: 'localhost',
      port: 27017,
      username: 'origami',
      password: 'origami',
      database: `origami-${_name}`,
      type: 'mongodb'
    }
  } as Origami.Config;
};


export interface NewAnswers {
  theme?: {
    type: string;
  };
  store?: {
    type: string;
  };
  server?: {
    secret: string;
    port: string | number;
  };
}


/**
 * Validates a prompt to ensure there is a value
 * @param v Value passed
 */
const required = (v: string) => {
  if (!v) return 'This field is required';
  return true;
};


/**
 * Extracts modules out of the package.json file in the format of:
 * 'origami-{{name}}-x' and converts them into Inquirer questions.
 * @param p Package.json file as json
 * @param name type of module to extract from package.json
 * @param message Prompt for Inquirer
 * @param def Default value
 * @returns Two Inquirer questions for selecting a value
 */
const listOther = (
  p: PackageJson,
  name: Origami.ModuleType,
  message: string,
  def: string
): inq.Question[] => {

  // Regex to extract value from dependencies
  const r: RegExp = new RegExp(`origami-${name}-(.*)`);

  let data: Object[] = [];

  // Filter out the packages that are needed
  if (p.dependencies) {
    data = Object.keys(p.dependencies)
      .filter((k) => r.test(k))
      .map((k: string) => r.exec(k)![1]);
  }


  // Return a
  return [
    {
      type: 'list',
      choices: _.uniq([...data, ...defaultData[name], 'Other'].filter((v) => v)),
      name: `${name}.type`,
      default: data[0] || def,
      message
    }, {
      name: `${name}.type`,
      when: (opts: inq.Answers) => opts[name].type === 'Other',
      validate: required,
      message
    }
  ];
};


/**
 * Prompts user for the information to create the .origami file with
 * @async
 * @returns Origami settings object
 */
export const prompt = async (
  useDefaults: boolean = false,
  directory?: string
): Promise<Origami.Config> => {

  const defaults = await defaultConfig(directory);
  if (useDefaults) return defaults;


  const _p = await pkgjson.read();
  const p: PackageJson = _p ? _p as PackageJson : { dependencies: {} };

  const when = (key: string) =>
    (response: any) => response && response[key].type !== 'None';


  let answers: NewAnswers = {};
  answers = {
    ...answers,
    ...await inq.prompt([
      // ------------------------------------------------------------- App
      {
        name: 'app.name',
        default: p.name || (defaults.app || {} as any).name || 'Origami Site',
        message: 'App/site name'
      },

      // ----------------------------------------------------------- Store
      ...listOther(p, 'store', 'Store (Database) type', 'lowdb'),
      {
        when: when('store'),
        name: 'store.host',
        message: 'Store host',
        default: defaults.store!.host,
        validate: required
      },
      {
        when: when('store'),
        name: 'store.port',
        message: 'Store port',
        default: defaults.store!.port,
        validate: required
      },
      {
        when: when('store'),
        name: 'store.database',
        message: 'Store database',
        default: defaults.store!.database,
        validate: required
      },
      {
        when: when('store'),
        name: 'store.username',
        message: 'Store username',
        default: defaults.store!.username,
        validate: required
      },
      {
        when: when('store'),
        type: 'password',
        name: 'store.password',
        message: 'Store password',
        default: defaults.store!.password,
        validate: required
      },

      // ----------------------------------------------------------- Theme
      // ...listOther(p, 'theme', 'Theme', 'snow')
    ])
  };

  if (answers.store && answers.store.type) {
    answers.store.type = answers.store.type.toLowerCase();
  }


  // ------------------------------------------------------------------ Server
  interface Result {
    default: boolean;
  }
  const secretText = 'Auto-generated secret';

  // Check if the user wants to use default config for server...
  if ((await inq.prompt({
    type: 'confirm',
    message: 'Use default server config?',
    name: 'default'
  }) as Result).default) {

    // Use default
    // @ts-ignore
    answers = {
      ...answers,
      ...{ server: defaults.server }
    };


  } else {
    // Otherwise customize...
    answers = {
      ...answers,
      ...await inq.prompt([
        {
          message: 'Server port',
          default: defaults.server.port,
          name: 'server.port',
          validate: required
        },
        {
          message: 'Server secret',
          default: secretText,
          name: 'server.secret'
        }
      ])
    };
  }


  // If no store is selected, don't install it
  if (answers.store && answers.store.type === 'None') delete answers.store;


  // Convert the answer from dot notation
  dotObj(answers);

  // Temp interface so the theme.type can be converted
  interface TempConfig extends Origami.Config {
    theme: {
      type: string;
      name: string;
    };
  }

  // @ts-ignore This is modified by the dotObj
  const file = answers as TempConfig;


  if (file.server.secret === secretText) {
    file.server.secret = defaults.server.secret;
  }

  // Enable admin by default
  file.admin = true;

  // file.theme.name = file.theme.type;
  // delete file.theme.type;
  return file as Origami.Config;
};
