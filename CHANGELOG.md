# Changes to rollup-plugin-pug

## [1.0.0] - 2018-09-18

### Added
- Typescript definitions
- Watch the included files in static templates.
- AppVeyor Test.

### Changed
- peerDependencies has rollup>=0.61 to allow dependency detection (see Rollup [#2259](https://github.com/rollup/rollup/pull/2259))
- Updated devDependencies
- Now the development of this plugin uses rollup v0.66 and Typescript v3.0

### Removed
- Dependency on rollup-plugin-buble as Rollup does not depends on it.

## [0.1.6] - 2017-06-21

### Changed
- Updated devDependencies.

### Fixed
- Fixes package installation.

## [0.1.5] - 2017-06-20

### Added
- A custom runtime can be set through the `pugRuntime` option.
- `pugRuntime: false` avoids importation of the pug-runtime.

### Fixed
- The pug option `inlineRuntimeFunctions` is honored and the runtime is not imported.

## [0.1.4] - 2017-05-18

### Added
- Support for ES6 `import` statements in one-line unbuffered code (starting with dash).

### Changed
- Pug `render` method is used instead `compile` and receives `locals` and all the plugin options as parameter, so `_pug_options` is not used anymore (thanks to @StreetStrider).

## [0.1.3] - 2017-03-11

### Added
- For static compilation, all the compiler options are passed through the `_pug_options` value to the template.

### Changed
- Using the lastest Pug version.
- Updated devDependencies.

## [0.1.2] - 2016-11-02

### Fixed
- Minor fix to `compileDebug` forced to `true` on source map generation.

## [0.1.1] - 2016-11-02

### Changed
- `sourceMap` is enabled without the `compileDebug`, regression of this option to `false`.
- Updated gen-pug-source-map devDependency to v0.1.1, almost ready for production.

## [0.1.0] - 2016-10-31

Complete rewrite, WIP

### Added
- Experimental support for source maps.
- Now the plugin imports an internal version of the pug-runtime *if* is necessary, so you don't have to worry about this anymore.
- The new property `locals` is a plain JavaScript object with values passed to the compiler for static compilation.
- The new property `staticPattern` is a regex that matches filenames to compile and evaluate at build time to produce plain HTML, so the loading of templates is faster, useful in SSR.

### Changed
- The `basedir` option defaults to the absolute path of your rollup `entry` file.
- Files from the `extend` and `include` directives are imported by the template, so changes in this dependencies must update the template in watch mode - See issue [#3](https://github.com/aMarCruz/rollup-plugin-pug/issues/3).

## [0.0.2] - 2016-08-28
- Initial release
