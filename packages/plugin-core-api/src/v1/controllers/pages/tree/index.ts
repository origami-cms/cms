import { Route } from '@origami/core-lib';

const r = new Route('/tree');
module.exports = r;

r.get(async (req, res, next) => {
  const model = await res.app.get('store').model('page');

  interface Page {
    id: string;
    url: string;
    title: string;
  }
  const rootPages: Page[] = await model.find({ parent: null });

  const data = [] as Page[];

  await Promise.all(rootPages.map(async (page) =>
    new Promise(async (_res) => {
      (data as object[]).push({
        id: page.id,
        url: page.url,
        title: page.title,
        children: await model.children(page.id, ['url', 'title'])
      });
      _res();
    })
  ));

  res.locals.content.set(data);

  next();
});
