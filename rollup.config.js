/* eslint no-var:0 */

import buble from 'rollup-plugin-buble'

var pkg = require('./package.json')

var external = Object.keys(pkg.dependencies).concat(['fs', 'path'])


export default {
  entry: 'src/index.js',
  plugins: [
    buble()
  ],
  external: external,
  targets: [
    {
      format: 'es',
      dest: pkg.module
    },
    {
      format: 'cjs',
      dest: pkg.main
    }
  ],
  interop: false,
  sourceMap: true
}
