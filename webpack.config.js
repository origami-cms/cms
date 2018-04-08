const path = require('path');
const PATH_SRC = path.resolve(__dirname, 'src');
const PATH_DIST = path.resolve(__dirname, '_bundles');

const BitBarPlugin = require('bitbar-webpack-progress-plugin');

module.exports = {
    entry: {
        'bundle': path.join(PATH_SRC, 'index.ts')
    },
    module: {
        rules: [
            {
                test: /\.ts/,
                loader: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    output: {
        filename: '[name].js',
        path: PATH_DIST,
        libraryTarget: 'umd',
        library: 'bundle',
        umdNamedDefine: true
    },
    node: {
        fs: 'empty'
    },
    target: 'node',
    plugins: [
        new BitBarPlugin()
    ]
};
