
var rollup = require('rollup').rollup;
var assert = require('assert');
var _pug   = require('../');

if (typeof window === 'object') {
  window.myGlobal = 'GLOBAL';
} else {
  global.myGlobal = 'GLOBAL';
}

process.chdir(__dirname);

function executeBundle (bundle) {
  var result = bundle.generate({
    format: 'cjs'
  });
  var fn = new Function('require', 'module', 'assert', result.code);
  var module = {};

  fn(require, module, assert);

  return module;
}

describe('rollup-plugin-pug', function () {

  it('compiles pug templates to funcions', function () {
    return rollup({
      entry: 'samples/basic/main.js',
      plugins: [ _pug() ],
      external: [ 'pug-runtime' ]
    }).then(executeBundle);
  });

  it('inserts the includes into template', function () {
    return rollup({
      entry: 'samples/include/main.js',
      plugins: [ _pug() ],
      external: [ 'pug-runtime' ]
    }).then(executeBundle);
  });

  it('can access pug options', function () {
    return rollup({
      entry: 'samples/global/main.js',
      plugins: [ _pug({
        globals: [ 'myGlobal' ]
      }) ],
      external: [ 'pug-runtime' ]
    }).then(executeBundle);
  });

});
