const path = require('path');
const {Route} = require('@origami/core-lib');

const r = new Route('/api/v1/admin/logo');
module.exports = r;

r.post(async (req, res, next) => {
    try {
        const store = res.app.get('store');
        const settings = store.model('setting');
        const media = store.model('media');

        // Validate the media exists...
        const file = await media.find({id: req.body.logo});
        if (!file) throw new Error('Could not find media with id');

        const [logo] = await settings.find({
            setting: 'admin.logo'
        });

        if (!logo) {
            await settings.create({
                setting: 'admin.logo',
                value: req.body.logo
            });
            res.text = 'Successfully created logo';
        } else {
            await settings.update({setting: 'admin.logo'}, {
                value: req.body.logo
            });
            res.text = 'Successfully updated logo';
        }
        next();

    } catch (e) {
        next(e);
    }
});
