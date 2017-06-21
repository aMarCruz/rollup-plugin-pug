const g = typeof window == 'object' ? window : global
g.pug = {
  escape: function (s) { return s || '' },
  rethrow: function () {}
}

import template from './template.pug'

var data = { name: 'World' }

assert.equal(template(data), '<p>Hello World</p>')
