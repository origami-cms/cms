import fs from 'fs';
import path from 'path';
import { OrigamiError } from '../OrigamiError';
import { engines } from './engines';


export type CompileFunction = (template: string, data?: object) => Promise<string>;

export class ErrorRendererNoEngine extends OrigamiError {
  constructor(ext: string) {
    super(
      'Renderer',
      'NoEngine',
      `No engine is configured for the '${ext}' filetype.`
    );
  }
}

export class ErrorRendererEngineNotInstalled extends OrigamiError {
  constructor(ext: string) {
    super(
      'Renderer',
      'EngineNotInstalled',
      `No engine is configured for the '${ext}' filetype.`
    );
  }
}

export interface Engine {
  name: string | false;
  engine: any;
}


export class Renderer {
  public engines: { [engine: string]: string | boolean } = engines;

  private _engineCache: {
    [engine: string]: CompileFunction;
  } = {};


  constructor(
    public packageDir = path.resolve(process.cwd(), 'node_modules')
  ) { }


  public async render(file: string, data?: object): Promise<string> {
    const ext = path.extname(file).slice(1);
    const engine = this._getEngine(ext);
    return engine(file, data);
  }


  private _getEngine(ext: string): CompileFunction {
    // Load from cache
    if (ext && this._engineCache[ext]) return this._engineCache[ext];


    // Engine npm package name
    const enginePkgName = this.engines[ext];
    if (!enginePkgName) throw new ErrorRendererNoEngine(ext);

    let engine: any;

    if (typeof enginePkgName === 'string') {
      // Attempt to load the package
      try {
        engine = require(path.resolve(this.packageDir, enginePkgName));

      } catch (e) {
        throw new ErrorRendererEngineNotInstalled(enginePkgName);
      }
    }

    // Wrap the engine in a CompileFunction syntax
    switch (ext) {
      case 'jade':
      case 'pug':
        return this._engineCache[ext] = async (
          template: string, data?: object
        ): Promise<string> => {
          // TODO: Remove dependency
          // tslint:disable-next-line no-require-imports
          const markdown = require('marked');
          markdown.setOptions({
            breaks: true,
            gfm: true
          });

          const options = {
            filename: template,
            filters: { markdown }
          };

          return engine.compile(
            fs.readFileSync(template).toString(),
            options
          )({data});
        };


      case 'hbs':
      case 'ejs':
        return this._engineCache[ext] = async (template: string, data?: object) =>
          engine.compile(
            fs.readFileSync(template).toString(),
          )(data);


      case 'scss':
      case 'sass':
        return this._engineCache[ext] = async (
          template: string, options?: any
        ) => {
          const includePaths = [path.dirname(template)];
          if (options && options.includePaths && options.includePaths instanceof Array) {
            includePaths.concat(options.includePaths);
          }

          return engine.renderSync({
            ...{
              indentedSyntax: ext === 'sass'
            },
            ...options,
            includePaths,
            data: fs.readFileSync(template).toString(),
          }).css.toString();
        };


      default:
        return async (text: string) => Promise.resolve(fs.readFileSync(text).toString());
    }
  }
}
