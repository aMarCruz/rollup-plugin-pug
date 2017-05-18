
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
  writeBundle(bundle, name)

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
        locals: { name: 'pug', other: 'other' }
      })]
    })
    .then(function (bundle) {
      executeBundle(bundle, 'precompile')
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
})
