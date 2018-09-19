[![Build Status][build-image]][build-url]
[![npm Version][npm-image]][npm-url]
[![License][license-image]][license-url]

# rollup-plugin-pug

[Rollup](https://github.com/rollup/rollup) plugin that transforms [Pug](https://pugjs.org) v2 templates to ES6 modules.

* Dynamic generation of HTML. Static HTML is optional and configurable.
* Automatic `import` of the pug-runtime in your bundle, if required.
* Automatic `import` of template `extends` and `includes`.
* Source map support.
* Support for ES6 `import` statements (moved out of the template).
* Typescript v3.x definitions.

## IMPORTANT

v1.0 requires Rollup 0.61 or later.

## Installation

```bash
npm install rollup-plugin-pug --save-dev
```

## Usage

Create the template:

```jade
//- template.pug
p= message
```

Import the template:

```js
import template from './template.pug';

const context = { message: 'Hello World' };

console.log(template(context));  // <p>Hello World</p>
```

or by renaming the template to 'template.static.pug'

```js
import template from './template.static.pug';

console.log(template);  // <p>Hello World</p>
```

and build with something like...

```js
import { rollup } from 'rollup';
import pug from 'rollup-plugin-pug';

rollup({
  entry: 'src/main.js',
  plugins: [
    pug({
      // your options here
      locals: { message: 'Hello World' }
    })
  ]
}).then(...)
```

That's it.


## Options

In addition to the regular pug options, the plugin defines these:

- `staticPattern` - Regex for files to compile and evaluate at build time to export plain HTML.
- `locals` - Plain JavaScript object with values passed to the compiler for static compilation.
- `include` - minimatch or array of minimatch with files that should be included by default.
- `exclude` - minimatch or array of minimatch with files that should be excluded by default.
- `extensions` - Array of extensions to process (don't use wildcards here).
- `pugRuntime` - Custom Pug runtime filename (See note).
- `sourceMap` - Enabled by default.

**Tip:** Use `staticPattern: /\S/` to evaluate all the templates at build time.

**Note:**

The `pugRuntime` option can be set to `false` to avoid importing the runtime, but you must provide an equivalent accessible to the template:

```js
  // in rollup.config.js
   ...
   plugins: [
     pug({ pugRuntime: false })
   ]
```

your .pug files:
```jade
- import pug from 'runtime'
p= name
//- ...etc
```

or you can name it in the config:
```js
  // in rollup.config.js
   ...
   plugins: [
     pug({ pugRuntime: 'runtime' })
   ]
```

and write your template as normal.

Search for "pugRuntime" in the `test/run.js` file to see examples.


## Pug Options

The plugin has preset the following options:

```js
{
  doctype: 'html',
  basedir: absolute(entry),       // absolute path of your rollup `entry` file
  compileDebug: false,            // `true` is recommended for development
  sourceMap: true,                // with or without compileDebug option
  inlineRuntimeFunctions: false,  // can be `false` now
  extensions: ['.pug', '.jade'],
  staticPattern: /\.static\.(?:pug|jade)$/
}
```

See the full list and explanation in the [API Documentation](https://pugjs.org/api/reference.html) of the pug site.


## What's New

### Added
- Typescript definitions
- Watch the included files in static templates.
- AppVeyor tests.

### Changed
- peerDependencies has rollup>=0.61 to allow dependency detection (see Rollup [#2259](https://github.com/rollup/rollup/pull/2259))
- Updated devDependencies
- Now the development of this plugin uses rollup v0.66 and Typescript v3.0

### Removed
- Dependency on rollup-plugin-buble as Rollup does not depends on it.

See the [CHANGELOG](CHANGELOG.md) for more changes.


## Licence

The [MIT](LICENSE) license.

[build-image]:    https://img.shields.io/travis/aMarCruz/rollup-plugin-pug.svg
[build-url]:      https://travis-ci.org/aMarCruz/rollup-plugin-pug
[npm-image]:      https://img.shields.io/npm/v/rollup-plugin-pug.svg
[npm-url]:        https://www.npmjs.com/package/rollup-plugin-pug
[license-image]:  https://img.shields.io/npm/l/express.svg
[license-url]:    https://github.com/aMarCruz/rollup-plugin-pug/blob/master/LICENSE
