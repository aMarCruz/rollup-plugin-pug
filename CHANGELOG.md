# Changes to rollup-plugin-pug

### 2017-06-21 v0.1.6
- Fixes package installation.
- Updated devDependencies.

### 2017-06-20 v0.1.5
- A custom runtime can be set through the `pugRuntime` option.
- `pugRuntime: false` avoids importation of the pug-runtime.
- The pug option `inlineRuntimeFunctions` is honored and the runtime is not imported.

### 2017-05-18 v0.1.4
- Pug `render` is used instead `compile` receiving `locals` and all the plugin options as parameter, so `_pug_options` is not used anymore (thanks to @StreetStrider).
- Support for ES6 `import` statements in one-line unbuffered code (starting with dash).

### 2017-03-11 v0.1.3
- For static compilation, all the compiler options is passed through the `_pug_options` value to the template.
- Using the lastest Pug version.
- Updated devDependencies.

### 2016-11-02 v0.1.2
- Minor fix to `compileDebug` forced to `true` on source map generation.

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
