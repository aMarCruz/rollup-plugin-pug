
var rollup = require('rollup').rollup
var buble  = require('rollup-plugin-buble')
var assert = require('assert')
var _pug   = require('../')

var WRITE_BUNDLE = true

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
    bundle.write({ format: 'cjs', dest: '~tmp/' + name + '.js' })
  }
}


function executeBundle (bundle, name) {
  var result = bundle.generate({
    format: 'cjs'
  })

  if (name) {
    writeBundle(bundle, name)
  }

  // eslint-disable-next-line no-new-func
  var fn = new Function('require', 'module', 'assert', result.code)
  var module = {}

  fn(require, module, assert)
}


describe('rollup-plugin-pug', function () {

  it('compiles pug templates to funcions', function (done) {
    rollup({
      entry: 'fixtures/basic/main.js',
      plugins: [_pug(), buble()]
    })
    .then(function (bundle) {
      executeBundle(bundle, 'basic')
      done()
    })
    .catch(done)
  })

  it('inserts the includes into the template', function (done) {
    rollup({
      entry: 'fixtures/include/main.js',
      plugins: [_pug(), buble()]
    })
    .then(function (bundle) {
      executeBundle(bundle, 'include')
      done()
    })
    .catch(done)
  })

  it('can use pug options', function (done) {
    rollup({
      entry: 'fixtures/options/main.js',
      plugins: [_pug({
        doctype: 'strict',
        pretty: '\t'
      })]
    })
    .then(function (bundle) {
      executeBundle(bundle, 'options')
      done()
    })
    .catch(done)
  })

  it('allows custom globals in addition to the default ones', function (done) {
    rollup({
      entry: 'fixtures/custom_globals/main.js',
      plugins: [_pug({
        sourceMap: false,
        globals: ['require', 'String'] // String is default, coverage only
      })]
    })
    .then(function (bundle) {
      var result = bundle.generate({
        format: 'es'
      })
      writeBundle(bundle, 'custom_globals')

      assert(result.code.indexOf('typeof require2!') > -1)
      assert(result.code.indexOf('typeof require!') < 0)
      assert(result.code.indexOf('typeof Math!') < 0)

      done()
    })
    .catch(done)
  })

  it('can use .pug extensions', function (done) {
    rollup({
      entry: 'fixtures/basic/main.js',
      plugins: [_pug({
        extensions: 'pug'
      })]
    })
    .then(function (bundle) {
      executeBundle(bundle)
      done()
    })
    .catch(done)
  })

  it('can use the `include: []` option with `extensions: "*"`', function (done) {
    rollup({
      entry: 'fixtures/basic/main.js',
      plugins: [_pug({
        include: '**/*.pug',
        extensions: '*'
      })]
    })
    .then(function (bundle) {
      executeBundle(bundle)
      done()
    })
    .catch(done)
  })

  it('move imports after a dash out of the pug function', function (done) {
    rollup({
      entry: 'fixtures/imports/main.js',
      plugins: [_pug()]
    })
    .then(function (bundle) {
      executeBundle(bundle, 'imports')
      done()
    })
    .catch(done)
  })

  it('has static compilation', function (done) {
    rollup({
      entry: 'fixtures/precompile/main.js',
      plugins: [_pug({
        locals: { name: 'pug', other: 'other' },
        option_local: 'option_local',
      })]
    })
    .then(function (bundle) {
      executeBundle(bundle, 'precompile')
      done()
    })
    .catch(done)
  })

  it('static compilation ignores compileDebug', function (done) {
    rollup({
      entry: 'fixtures/precompile/main.js',
      plugins: [_pug({
        locals: { name: 'pug', other: 'other' },
        option_local: 'option_local',
        compileDebug: true
      })]
    })
    .then(function (bundle) {
      executeBundle(bundle, 'precompile_debug')
      done()
    })
    .catch(done)
  })

  it('defaults to the correct path based on rollup entry', function (done) {
    rollup({
      entry: '../test/fixtures/app/index.js',
      plugins: [_pug()]
    })
    .then(function (bundle) {
      var result = bundle.generate({
        format: 'es'
      })
      writeBundle(bundle, 'app')

      assert(~result.code.indexOf('Article'))

      done()
    })
    .catch(done)
  })

  it('does not import the Pug runtime if `pugRuntime` is falsy', function (done) {
    rollup({
      entry: 'fixtures/no_runtime/main.js',
      plugins: [_pug({
        pugRuntime: false
      })]
    })
    .then(function (bundle) {
      executeBundle(bundle, 'no_runtime')
      done()
    })
    .catch(done)
  })

  it('allows import a custom Pug runtime with `pugRuntime: "[custom-runtime]"`', function (done) {
    rollup({
      entry: 'fixtures/custom_runtime/main.js',
      plugins: [_pug({
        pugRuntime: 'pug-runtime',
      })],
      external: ['pug-runtime']
    })
    .then(function (bundle) {
      executeBundle(bundle, 'custom_runtime')
      done()
    })
    .catch(done)
  })

  it('can import custom runtime w/ `import pug from...` and `pugRuntime: false`', function (done) {
    var alias = require('rollup-plugin-alias')

    rollup({
      entry: 'fixtures/runtime_import/main.js',
      plugins: [
        _pug({
          pugRuntime: false
        }),
        alias({
          pug_runtime: '../dist/runtime.es.js'
        })
      ]
    })
    .then(function (bundle) {
      executeBundle(bundle, 'runtime_import')
      done()
    })
    .catch(done)
  })

  it('allows to skip runtime import with the `inlineRuntimeFunctions` option', function (done) {
    rollup({
      entry: 'fixtures/custom_runtime/main.js',
      plugins: [_pug({
        inlineRuntimeFunctions: true,
        sourceMap: false
      })]
    })
    .then(function (bundle) {
      debugger
      executeBundle(bundle, 'inline_runtime')
      done()
    })
    .catch(done)
  })

})
