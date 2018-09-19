/*
  Create a pug-runtime module.

  2018-09-18:amc: using ES6
*/
const path = require('path')
const fs = require('fs')

const indent = '  '
const prefix = 'export default (function(exports) {\n'
const suffix = `\n${indent}return exports\n})({});\n`

let pugPath = require.resolve('pug-runtime')
let runtime = fs.readFileSync(pugPath, 'utf8')

runtime = runtime.replace(/^(?=[ \t]*\S)/gm, indent)

pugPath = path.join(__dirname, 'dist', 'runtime.es.js')
runtime = prefix + runtime + suffix

fs.writeFileSync(pugPath, runtime, 'utf8')

console.log(`> ${pugPath} written.\n`)  //eslint-disable-line no-console
