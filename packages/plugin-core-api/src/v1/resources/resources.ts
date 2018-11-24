import * as models from '../models';

export const resources = (app: any) => {
  [
    'setting',
    'theme',
    'user'
  ]
    .forEach((res) => {
      let controllers;
      try {
        controllers = require(`./${res}`);
      } catch (e) { }

      app.resource(res, {
        // @ts-ignore
        model: models[res],
        controllers
      });
    });
};
