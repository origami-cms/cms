import { Route } from '@origami/core';
import { template } from './template';

export const final = new Route('/final').get((req, res) => {
  res.contentType('html');
  res.send(template);
});
