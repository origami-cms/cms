import {Route} from '@origami/core-lib';

const r = new Route('/:pageId');
module.exports = r;

r.get(async (req, res, next) => {
    try {
        const model = await res.app.get('store').model('page');
        res.locals.content.set(await model.children(req.params.pageId, ['url', 'title']));
        next();
    } catch (e) {
        next(e);
    }
});
