import { Origami, Route } from '@origami/core';

const REDIRECT = 303;

// Redirect the user after setup
export const redirect = new Route('/setup')
  .position('init')
  .get(async (req, res, next) => {
    const user = (await res.app
      .get('store')
      .model('user')) as Origami.Store.Model;
    const users = await user.find({});

    if (users && users.length) res.redirect(REDIRECT, '/');
    else next();
  });
