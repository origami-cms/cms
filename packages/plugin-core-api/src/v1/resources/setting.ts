import {Origami} from '@origami/core-lib';


interface Settings {
    [key: string]: any;
}
interface Setting {
    setting: string;
    value: any;
}


export const list: Origami.Server.RequestHandler = async(req, res, next) => {
    try {
        const model = await res.app.get('store').model('setting');

        res.locals.content.set(
            (await model.find())
                .reduce(
                    (settings: Settings, s: Setting) => {
                        settings[s.setting] = s.value;
                        return settings;
                    },
                    {}
                )
        );
        next();

    } catch (e) {
        next(e);
    }
};


export const create: Origami.Server.RequestHandler = async(req, res, next) => {
    try {
        const model = await res.app.get('store').model('setting');
        await model.create(req.body);
        next();
    } catch (e) {
        next(e);
    }
};


const find = async (req: Origami.Server.Request, res: Origami.Server.Response) => {
    const model = await res.app.get('store').model('setting');
    const [setting] = await model.find({
        setting: req.params.settingId
    });
    if (!setting) throw new Error('resource.errors.notFound');
    return {
        value: setting.value,
        model
    };
};


export const get: Origami.Server.RequestHandler = async (req, res, next) => {
    try {
        res.locals.content.set(
            (await find(req, res)).value
        );
        next();
    } catch (e) {
        next(e);
    }
};


export const update: Origami.Server.RequestHandler = async (req, res, next) => {
    try {
        const {model} = await find(req, res);
        model.update({setting: req.params.setting}, {value: req.body.value});
        next();
    } catch (e) {
        next(e);
    }
};
