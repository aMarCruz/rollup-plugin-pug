
var rollup = require('rollup').rollup
var buble  = require('rollup-plugin-buble')
var assert = require('assert')
var _pug   = require('../')

process.chdir(__dirname)

function executeBundle (bundle) {
  var result = bundle.generate({
    format: 'cjs'
  })
  console.log('-----')
  require('fs').writeFileSync('fixtures/out-bundle.js', result.code, 'utf8')

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

  it.only('the includes are listed as dependency in the code', function (done) {
    rollup({
      entry: 'fixtures/include/main.js',
      plugins: [_pug(), buble()]
    })
    .then(function (bundle) {
      var result = bundle.generate({
        format: 'es'
      })
      console.log('-----')
      require('fs').writeFileSync('fixtures/out-bundle-es6.js', result.code, 'utf8')
      done()
    })
    .catch(done)
  })

  it('can use pug options', function () {
    return rollup({
      entry: 'fixtures/options/main.js',
      plugins: [_pug({
        doctype: 'strict',
        pretty: '\t'
      })],
      external: ['pug-runtime']
    }).then(executeBundle)
  })

})
