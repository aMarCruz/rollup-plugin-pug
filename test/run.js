
var rollup = require('rollup').rollup
var buble  = require('rollup-plugin-buble')
var assert = require('assert')
var _pug   = require('../')

process.chdir(__dirname)

function executeBundle (bundle) {
  var result = bundle.generate({
    format: 'cjs'
  })

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
      executeBundle(bundle)
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
      executeBundle(bundle)
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
      executeBundle(bundle)
      done()
    })
    .catch(done)
  })

  it('has static compilation', function (done) {
    rollup({
      entry: 'fixtures/precompile/main.js',
      plugins: [_pug({
        locals: { name: 'pug' }
      })]
    })
    .then(function (bundle) {
      executeBundle(bundle)
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
      assert(~result.code.indexOf('Article'))

      done()
    })
    .catch(done)
  })
})
