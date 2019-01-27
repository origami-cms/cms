const path = require('path');
const {Route} = require('@origami/core-lib');
const {URI_PREFIX} = require('../');

const sendDefault = res => {
    return res.sendFile(path.resolve(__dirname, '../content/logo.svg'));
};

const r = new Route(`${URI_PREFIX}/images/logo`);
module.exports = r;

r.get(async (req, res, next) => {
    try {
        if (res.headersSent) return next();

        if (req.params.userId === 'default') return sendDefault(res);
        const store = res.app.get('store');

        const settings = store.model('setting');
        const [setting] = await settings.find({setting: 'admin.logo'});


        if (!setting) return sendDefault(res);

        const files = store.model('media');
        const logo = await files.find({
            id: setting.value
        });


        if (!logo) return sendDefault(res);

        res.header('content-type', logo.type);
        res.sendFile(path.resolve(process.cwd(), 'media', logo.id));
    } catch (e) {
        next(e);
    }
});
