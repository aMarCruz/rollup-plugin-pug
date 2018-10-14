'use strict'

const rollup = require('rollup').rollup
const assert = require('assert')
const _pug   = require('../')

const WRITE_BUNDLE = true

process.chdir(__dirname)

try {
  require('fs').mkdirSync('./~tmp')
} catch (err) {
  if (err.code !== 'EEXIST') {
    throw err
  }
}

function writeBundle (bundle, name) {
  if (WRITE_BUNDLE && name) {
    bundle.write({ format: 'cjs', file: `~tmp/${name}.js` })
  }
}


function executeBundle (bundle, name) {
  bundle.generate({
    format: 'cjs',
  }).then((result) => {
    if (name) {
      writeBundle(bundle, name)
    }

    // eslint-disable-next-line no-new-func
    const fn = new Function('require', 'module', 'assert', result.code)
    const module = {}

    fn(require, module, assert)
  })
}


describe('rollup-plugin-pug', function () {

  it('compiles pug templates to funcions', function (done) {
    rollup({
      input: 'fixtures/basic/main.js',
      plugins: [_pug()],
    })
      .then((bundle) => executeBundle(bundle, 'basic'))
      .then(done, done)
  })

  it('inserts the includes into the template', function (done) {
    rollup({
      input: 'fixtures/include/main.js',
      plugins: [_pug()],
    })
      .then((bundle) => executeBundle(bundle, 'include'))
      .then(done, done)
  })

  it('can use pug options', function (done) {
    rollup({
      input: 'fixtures/options/main.js',
      plugins: [_pug({
        doctype: 'strict',
        pretty: '\t',
      })],
    })
      .then((bundle) => executeBundle(bundle, 'options'))
      .then(done, done)
  })

  it('allows custom globals in addition to the default ones', function (done) {
    rollup({
      input: 'fixtures/custom_globals/main.js',
      plugins: [_pug({
        sourceMap: false,
        globals: ['require', 'String'], // String is default, coverage only
      })],
    })
      .then((bundle) => bundle.generate({ format: 'es' }))
      .then((result) => {
        //writeBundle(bundle, 'custom_globals')
        assert(result.code.indexOf('typeof require2!') > -1)
        assert(result.code.indexOf('typeof require!') < 0)
        assert(result.code.indexOf('typeof Math!') < 0)
      })
      .then(done, done)
  })

  it('can use .pug extensions', function (done) {
    rollup({
      input: 'fixtures/basic/main.js',
      plugins: [_pug({
        extensions: 'pug',
      })],
    })
      .then((bundle) => executeBundle(bundle))
      .then(done, done)
  })

  it('can use the `include: []` option with `extensions: "*"`', function (done) {
    rollup({
      input: 'fixtures/basic/main.js',
      plugins: [_pug({
        include: '**/*.pug',
        extensions: '*',
      })],
    })
      .then((bundle) => executeBundle(bundle))
      .then(done, done)
  })

  it('move imports after a dash out of the pug function', function (done) {
    rollup({
      input: 'fixtures/imports/main.js',
      plugins: [_pug()],
    })
      .then((bundle) => executeBundle(bundle, 'imports'))
      .then(done, done)
  })

  it('has static compilation', function (done) {
    rollup({
      input: 'fixtures/precompile/main.js',
      plugins: [_pug({
        locals: { name: 'pug', other: 'other' },
        option_local: 'option_local',
      })],
    })
      .then((bundle) => executeBundle(bundle, 'precompile'))
      .then(done, done)
  })

  it('static compilation ignores compileDebug', function (done) {
    rollup({
      input: 'fixtures/precompile/main.js',
      plugins: [_pug({
        locals: { name: 'pug', other: 'other' },
        option_local: 'option_local',
        compileDebug: true,
      })],
    })
      .then((bundle) => executeBundle(bundle, 'precompile_debug'))
      .then(done, done)
  })

  it('static compilation watch includes', function (done) {
    rollup({
      input: 'fixtures/precompile_inc/main.js',
      plugins: [_pug({
        locals: { name: 'pug', other: 'other' },
        option_local: 'option_local',
        compileDebug: true,
      })],
    })
      .then((bundle) => executeBundle(bundle, 'precompile_inc'))
      .then(done, done)
  })

  it('defaults to the correct path based on rollup input', function (done) {
    rollup({
      input: '../test/fixtures/app/index.js',
      plugins: [_pug()],
    })
      .then((bundle) => {
        return bundle.generate({ format: 'es' }).then((result) => {
          assert(~result.code.indexOf('Article'))
        })
      })
      .then(done, done)
  })

  it('gets the base path through the `basedir` option', function (done) {
    rollup({
      input: '../test/fixtures/app/index.js',
      plugins: [_pug({
        basedir: 'fixtures/app',
      })],
    })
      .then((bundle) => {
        return bundle.generate({ format: 'es' }).then((result) => {
          writeBundle(bundle, 'app')
          assert(~result.code.indexOf('Article'))
        })
      })
      .then(done, done)
  })

  it('does not import the Pug runtime if `pugRuntime` is falsy', function (done) {
    rollup({
      input: 'fixtures/no_runtime/main.js',
      plugins: [_pug({
        pugRuntime: false,
      })],
    })
      .then((bundle) => executeBundle(bundle, 'no_runtime'))
      .then(done, done)
  })

  it('allows import a custom Pug runtime with `pugRuntime: "[custom-runtime]"`', function (done) {
    rollup({
      input: 'fixtures/custom_runtime/main.js',
      plugins: [_pug({
        pugRuntime: 'pug-runtime',
      })],
      external: ['pug-runtime'],
    })
      .then((bundle) => executeBundle(bundle, 'custom_runtime'))
      .then(done, done)
  })

  it('can import custom runtime w/ `import pug from...` and `pugRuntime: false`', function (done) {
    const alias = require('rollup-plugin-alias')

    rollup({
      input: 'fixtures/runtime_import/main.js',
      plugins: [
        _pug({
          pugRuntime: false,
        }),
        alias({
          pug_runtime: '../dist/runtime.es.js',
        }),
      ],
    })
      .then((bundle) => executeBundle(bundle, 'runtime_import'))
      .then(done, done)
  })

  it('allows to skip runtime import with the `inlineRuntimeFunctions` option', function (done) {
    rollup({
      input: 'fixtures/custom_runtime/main.js',
      plugins: [_pug({
        inlineRuntimeFunctions: true,
        sourceMap: false,
      })],
    })
      .then((bundle) => executeBundle(bundle, 'inline_runtime'))
      .then(done, done)
  })

})
