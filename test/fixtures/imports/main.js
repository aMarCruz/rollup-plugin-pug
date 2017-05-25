import template from './template.pug'

var html = template()

assert(~html.indexOf('<h1>'))
assert(~html.indexOf('<p>foo</p>'))
assert(~html.indexOf('<p>bar</p>'))
