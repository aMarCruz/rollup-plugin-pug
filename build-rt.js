/* eslint no-var:0 */

var path = require('path')
var fs = require('fs')

var indent = '  '
var prefix = 'export default (function(exports){\n'
var suffix = '\n' + indent + 'return exports\n})({});\n'

var pugPath = require.resolve('pug-runtime')
var runtime = fs.readFileSync(pugPath, 'utf8')

runtime = runtime.replace(/^(?=[ \t]*\S)/gm, indent)

pugPath = path.join(__dirname, 'dist', 'runtime.es.js')
runtime = prefix + runtime + suffix

fs.writeFileSync(pugPath, runtime, 'utf8')

console.log('> ' + pugPath + ' written.\n')  //eslint-disable-line no-console
