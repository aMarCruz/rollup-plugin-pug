[![Build Status][build-image]][build-url]
[![npm Version][npm-image]][npm-url]
[![License][license-image]][license-url]

# rollup-plugin-pug

[Rollup](https://github.com/rollup/rollup) plugin that transform [pug](http://jade-lang.com/) templates in es6 modules.

## Installation

```bash
npm install --save-dev rollup-plugin-pug
```

## Usage

Install the pug-runtime in the app:

```bash
npm install --save pug-runtime
```

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
      // By default, all .jade and .pug files are compiled
      // extensions: [ '.jade', '.pug' ],
      // You can restrict which files are compiled
      // using `include` and `exclude`
      include: 'src/components/**.pug',
      // You can use native pug options as well.
      pretty: true
    })
  ]
}).then(...)
```

That's it.

## Options

This plugin is using the following pug options as defaults:

```js
{
  doctype: 'html',
  name: 'template',
  compileDebug: false,
  inlineRuntimeFunctions: false
}
```

See the full list and explanation in the [API Documentation](http://jade-lang.com/api/) of the pug site.

## Licence

MIT

[build-image]:    https://img.shields.io/travis/aMarCruz/rollup-plugin-pug.svg
[build-url]:      https://travis-ci.org/aMarCruz/rollup-plugin-pug
[npm-image]:      https://img.shields.io/npm/v/rollup-plugin-pug.svg
[npm-url]:        https://www.npmjs.com/package/rollup-plugin-pug
[license-image]:  https://img.shields.io/npm/l/express.svg
[license-url]:    https://github.com/aMarCruz/rollup-plugin-pug/blob/master/LICENSE
