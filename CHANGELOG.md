# Changes to rollup-plugin-pug

### 2016-11-02 v0.1.1
- sourceMap is enabled without the `compileDebug`, regression of this option to `false`.
- Updated gen-pug-source-map dev dependency to v0.1.1 almost ready for production.

### 2016-10-31 v0.1.0
- Experimental support for source maps.

### 2016-10-29 v0.1.0
Complete rewrite, WIP

- Now the plugin imports an internal version of the pug-runtime *if* is necessary, so you don't have to worry about this anymore.
- The `basedir` option default to the absolute path of your rollup `entry` file.
- The new property `locals` is a plain JavaScript object with values passed to the compiler for static compilation.
- The new property `staticPattern` is a regex that matches filenames to compile and evaluate at build time to produce plain HTML, so the loading of templates is faster, useful in SSR.
- Files from the `extend` and `include` directives are imported by the template, so changes in this dependencies must update the template in watch mode - See issue [#3](https://github.com/aMarCruz/rollup-plugin-pug/issues/3).

### 2016-08-28 v0.0.2
- Initial release
