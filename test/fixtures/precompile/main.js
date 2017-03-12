import html from './template.static.pug'

assert(~html.indexOf('<p>pug</p>'))
assert(~html.indexOf('<p>other</p>'))
