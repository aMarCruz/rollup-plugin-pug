import template from './template.pug'

var data = {}
var html = template(data).trim().replace(/[\n\r]/g, '')

assert.equal(html, '<form>\t<input type="checkbox" checked="checked"/></form>')
