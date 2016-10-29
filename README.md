[![Build Status][build-image]][build-url]
[![npm Version][npm-image]][npm-url]
[![License][license-image]][license-url]

# rollup-plugin-pug

[Rollup](https://github.com/rollup/rollup) plugin that transforms [Pug](http://jade-lang.com/) (aka Jade) templates to ES6 modules.


## Installation

```bash
npm install --save-dev rollup-plugin-pug
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

And build with something like...

```js
import { rollup } from 'rollup';
import pug from 'rollup-plugin-pug';

rollup({
  entry: 'src/main.js',
  plugins: [
    pug({
      // generate pre-evaluated HTML by using staticPattern
      staticPattern: /\/assets\//,
      // ...with values passed through the locals object
      locals: { appName: 'My App' }
      // use `include` and `exclude` to filter the files to compile
      include: 'src/components/**.pug',
      // You can use native pug options as well.
      pretty: true
    })
  ]
}).then(...)
```

That's it.


## Options

In addition to the regular pug options, the plugin defines this:

- `staticPattern` - Regex for files to compile and evaluate at build time that exports plain HTML.
- `locals` - Plain JavaScript object with values passed to the compiler for static compilation.
- `include` - minimatch or array of minimatch with files that should be included by default.
- `exclude` - minimatch or array of minimatch with files that should be excluded by default.
- `extensions` - array of extensions to process (don't use wildcards here).

**Tip:** Use `staticPattern: /\S/` to evaluate all the templates at build time.

The plugin is using the following pug options as defaults:

```js
{
  doctype: 'html',
  compileDebug: false,
  inlineRuntimeFunctions: false,
  extensions: ['.pug', '.jade'],
  staticPattern: /\.static\.(?:pug|jade)$/
}
```

The `inlineRuntimeFunctions` is forced, there's no reason to inline the runtime.

See the full list and explanation in the [API Documentation](https://pugjs.org/api/reference.html) of the pug site.


## What's New

Files from the `extend` and `include` directives are imported by the template, so changes in this dependencies will update the template (See issue [#3](https://github.com/aMarCruz/rollup-plugin-pug/issues/3)).

The new property `staticPattern` is used to compile and evaluate the template using the values given by `locals`, as it produces plain HTML the loading of templates is faster, useful in SSR.

Regular dynamic templates requires the "pug-runtime" package; from v0.1.0, the plugin imports an internal version of pug-runtime *if* is neccesary, so you don't have to worry about this.


## Licence

MIT

[build-image]:    https://img.shields.io/travis/aMarCruz/rollup-plugin-pug.svg
[build-url]:      https://travis-ci.org/aMarCruz/rollup-plugin-pug
[npm-image]:      https://img.shields.io/npm/v/rollup-plugin-pug.svg
[npm-url]:        https://www.npmjs.com/package/rollup-plugin-pug
[license-image]:  https://img.shields.io/npm/l/express.svg
[license-url]:    https://github.com/aMarCruz/rollup-plugin-pug/blob/master/LICENSE
