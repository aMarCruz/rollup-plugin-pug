[![Build Status][build-image]][build-url]
[![npm Version][npm-image]][npm-url]
[![License][license-image]][license-url]

# rollup-plugin-pug

[Rollup](https://github.com/rollup/rollup) plugin that transforms [Pug](http://jade-lang.com/) (aka Jade) templates to ES6 modules.


## Installation

```bash
npm install rollup-plugin-pug --save-dev
```

**Important:** See [What's New](#whats-new) for major changes in this version.

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

or rename the template to 'template.static.pug'

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
    pug(
      // your options here
      locals: { message: 'Hello World' }
    )
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
- `sourceMap` - Experimental, enabled by default, but only works if `compileDebug = true`.

**Tip:** Use `staticPattern: /\S/` to evaluate all the templates at build time.

The plugin has preset the following options:

```js
{
  doctype: 'html',
  basedir: absolute(entry),       // absolute path of your rollup `entry` file
  compileDebug: true,             // `true` is recommended for development
  sourceMap: true,                // unless compileDebug:false
  inlineRuntimeFunctions: false,  // forced, there's no reason to inline functions
  extensions: ['.pug', '.jade'],
  staticPattern: /\.static\.(?:pug|jade)$/
}
```

Perhaps the most important option that you need to review is `basedir`.

See the full list and explanation in the [API Documentation](https://pugjs.org/api/reference.html) of the pug site.


## What's New

- Now the plugin imports an internal version of the pug-runtime *if* is necessary, so you don't have to worry about this anymore.
- The `basedir` option default to the absolute path of your rollup `entry` file.
- The new property `locals` is a plain JavaScript object with values passed to the compiler for static compilation.
- The new property `staticPattern` is a regex that matches filenames to compile and evaluate at build time to produce plain HTML, so the loading of templates is faster, useful in SSR.
Experimental support for source maps, only for dynamic templates and if `compileDebug` is `true`.
- Now `compileDebug` defaults to `true` to allow source map generation.
- Files from the `extend` and `include` directives are imported by the template, so changes in this dependencies must update the template in watch mode - See issue [#3](https://github.com/aMarCruz/rollup-plugin-pug/issues/3).


## Licence

MIT

[build-image]:    https://img.shields.io/travis/aMarCruz/rollup-plugin-pug.svg
[build-url]:      https://travis-ci.org/aMarCruz/rollup-plugin-pug
[npm-image]:      https://img.shields.io/npm/v/rollup-plugin-pug.svg
[npm-url]:        https://www.npmjs.com/package/rollup-plugin-pug
[license-image]:  https://img.shields.io/npm/l/express.svg
[license-url]:    https://github.com/aMarCruz/rollup-plugin-pug/blob/master/LICENSE
