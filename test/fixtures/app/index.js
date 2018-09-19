/* eslint no-console:0 */
import fn from './index.pug'
import login from './login'

const html = fn()

assert(html.contains('Article'))
assert(html.contains('ThisIsThePugPlugin'))

login()
