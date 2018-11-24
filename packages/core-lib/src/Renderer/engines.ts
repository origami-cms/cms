export const engines = {
    pug: 'pug',
    jade: 'pug',

    hbs: 'handlebars',

    ejs: 'ejs',
    vue: false,
    underscore: false,
    nunjucks: false,
    react: false,
    marko: false,
    template7: false,
    twigjs: false,
    dust: false,
    hogan: false,
    swig: false,
    hyperscript: false,
    vash: false,
    jsrender: false,
    emblem: false,
    closure: false,
    json2html: false,
    mustache: false,


    scss: 'node-sass',
    sass: 'node-sass',


    // Render as is
    html: true,
    css: true,
    js: true

} as { [engine: string]: string | boolean };
