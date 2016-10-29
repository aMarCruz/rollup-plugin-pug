const pug = require('../../dist/rollup-plugin-pug.cjs')

export default {
  entry: 'index.js',
  external: [],
  plugins: [
    pug({ pugRuntime: './pug-runtime.es.js' })
  ]
}
