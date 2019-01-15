import fs from 'fs';
import path from 'path';
import minify from 'rollup-plugin-babel-minify';
import commonjs from 'rollup-plugin-commonjs';
import copy from 'rollup-plugin-copy';
import node from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import sass from 'rollup-plugin-sass';
import strip from 'rollup-plugin-strip';
import uglifycss from 'uglifycss';

const isProduction = process.env.NODE_ENV === "production";

export default {
  input: path.resolve(__dirname, './.tsbuild/app.js'),
  output: {
    format: 'iife',
    file: 'dist/app.js',
    sourcemap: true
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    node(),
    commonjs(),
    copy({
      './src/images': './dist/images',
      './src/app.html': './dist/index.html'
    }),

    sass({
      output(css) {
        if (isProduction) css = uglifycss.processString(css);
        fs.writeFileSync(path.resolve('./dist/app.css'), css);
      }
    }),

    ...(isProduction ? [
      strip(),
      minify({
        comments: false
      })
    ] : [])
  ],


}
