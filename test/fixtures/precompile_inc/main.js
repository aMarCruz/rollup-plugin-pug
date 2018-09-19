import html from './template.static.pug'

assert(html.match(/<p>.*?template\.static\.pug<\/p>/))
assert(~html.indexOf('<p>pug</p>'))
assert(~html.indexOf('<p>option_local</p>'))
assert(~html.indexOf('<p>other</p>'))
