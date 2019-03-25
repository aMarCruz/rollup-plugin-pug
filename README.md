# rollup-plugin-pug

[![License][license-image]][license-url]
[![npm Version][npm-image]][npm-url]
[![Linux build Status][build-image]][build-url]
[![Windows build status][appveyor-image]][appveyor-url]

[Rollup](https://github.com/rollup/rollup) plugin that transforms [Pug](https://pugjs.org) v2 templates to ES6 modules.

- Dynamic generation of HTML. Static HTML is optional and configurable.
- Automatic `import` of the pug-runtime in your bundle, if required.
- Automatic `import` of template `extends` and `includes`.
- Source map support.
- Support for ES6 `import` statements (moved out of the template).
- Typescript v3.x definitions.

## IMPORTANT

v1.1 requires Rollup 0.61 and node.js 6 or later, for previous versions use rollup-plugin-pug 0.1.6

## Installation

```bash
npm install rollup-plugin-pug --save-dev
```

## Usage

Create the template

```jade
//- template.pug
p= message
```

and import it as any other function:

```js
import templateFn from './template.pug';

const context = { message: 'Hello World' };

console.log(templateFn(context));  // <p>Hello World</p>
```

or rename it for static compilation and import it as string:

```js
import htmlString from './template.static.pug';

console.log(htmlString);  // <p>Hello World</p>
```

Build with something like...

```js
import { rollup } from 'rollup';
import pug from 'rollup-plugin-pug';

rollup({
  entry: 'src/main.js',
  plugins: [
    pug({
      locals: { message: 'Hello World' }
    })
  ]
}).then(...)
```

That's it.

## Options

In addition to the regular pug options, the plugin defines these:

- `staticPattern` - Regex for files to compile and evaluate at build time to export plain HTML.
- `locals` - Plain JavaScript object with values passed to the compiler for static compilation (Deprecated).
- `include` - minimatch or array of minimatch with files that should be included by default.
- `exclude` - minimatch or array of minimatch with files that should be excluded by default.
- `extensions` - Array of extensions to process (don't use wildcards here).
- `pugRuntime` - Custom Pug runtime filename (See note).
- `sourceMap` - Enabled by default.

**TIP:** Use `staticPattern: /\S/` to evaluate all the templates at build time.

### Be carefull

The parameter passed to the static templates is a shallow copy of the plugin options. Do not change it unless you know what you doing.

When a template matches the `staticPattern` regex, the template is executed at complie-time and you load the resulting string through `import` at runtime, so it will not have access to runtime variables or methods. Instead, the plugin passes its options to the template at compile-time.

## Default Options

The plugin has preset the following options:

```js
{
  doctype: 'html',
  basedir: absolute(input),       // absolute path of the rollup `input` option
  compileDebug: false,            // `true` is recommended for development
  sourceMap: true,                // with or without compileDebug option
  inlineRuntimeFunctions: false,  // use the pug runtime
  extensions: ['.pug', '.jade'],
  staticPattern: /\.static\.(?:pug|jade)$/
}
```

See the full list and explanation in the [API Documentation](https://pugjs.org/api/reference.html) of the pug site.

Note: The default of `staticPattern` was defined to be compatibile with the old Jade plugin and so it has remained, but I prefer `/\.html\.pug$/`.

## Custom runtime

The `pugRuntime` option can be set to `false` to avoid importing the runtime, but you must provide an equivalent `pug` object accessible to the template:

Disable the predefined runtime in rollup.config.js

```js
  ...
  plugins: [
    pug({ pugRuntime: false })
  ]
```

and import the yours in your .pug files

```jade
- import pug from 'my-runtime'
p= name
//- ...etc
```

but the recommended option is name it in the config:

```js
  // in rollup.config.js
   ...
   plugins: [
     pug({ pugRuntime: 'my-runtime' })
   ]
```

Search for "pugRuntime" in the `test/run.js` file to see examples.

## What's New

### v1.1.1

- #14: fix (this.warn is not a function) - thanks to @leptonix

See the [CHANGELOG](CHANGELOG.md) for more changes.

## Support my Work

I'm a full-stack developer with more than 20 year of experience and I try to share most of my work for free and help others, but this takes a significant amount of time and effort so, if you like my work, please consider...

<!-- markdownlint-disable MD033 -->

[<img src="https://amarcruz.github.io/images/kofi_blue.png" height="36" title="Support Me on Ko-fi" />][kofi-url]

Of course, feedback, PRs, and stars are also welcome 🙃

Thanks for your support!

[build-image]:    https://travis-ci.org/aMarCruz/rollup-plugin-pug.svg?branch=master
[build-url]:      https://travis-ci.org/aMarCruz/rollup-plugin-pug
[appveyor-image]: https://ci.appveyor.com/api/projects/status/us75417f6ls7yjik/branch/master?svg=true
[appveyor-url]:   https://ci.appveyor.com/project/aMarCruz/rollup-plugin-pug/branch/master
[npm-image]:      https://img.shields.io/npm/v/rollup-plugin-pug.svg
[npm-url]:        https://www.npmjs.com/package/rollup-plugin-pug
[license-image]:  https://img.shields.io/npm/l/express.svg
[license-url]:    https://github.com/aMarCruz/rollup-plugin-pug/blob/master/LICENSE
[kofi-url]:       https://ko-fi.com/C0C7LF7I
