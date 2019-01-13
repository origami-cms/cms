const path = require('path');
const {Route} = require('@origami/core-lib');
const {URI_PREFIX} = require('../');


const r = new Route('/api/v1/admin/theme');
module.exports = r;

r.get(async (req, res, next) => {
    try {
        const store = res.app.get('store');

        const settings = store.model('setting');

        const [theme] = await settings.find({setting: 'admin.theme'});
        if (!theme) return next();
        else res.data = theme.value;
        next();

    } catch (e) {
        next(e);
    }
});


r.post(async (req, res, next) => {
    try {
        const store = res.app.get('store');

        const settings = store.model('setting');

        res.data = (await settings.update(
            {setting: 'admin.theme'},
            {value: req.body},
            {upsert: true}
        )).value;
        next();

    } catch (e) {
        next(e);
    }
});
