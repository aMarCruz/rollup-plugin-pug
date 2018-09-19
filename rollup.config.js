import typescript from 'rollup-plugin-typescript2'
import pkgjson from './package.json'

const external = Object.keys(pkgjson.dependencies).concat(['fs', 'path'])
const banner =
`/**
 * rollup-plugin-pug v${pkgjson.version}
 * @author aMarCruz'
 * @license MIT'
 */`

export default {
  input: 'src/index.ts',
  plugins: [
    typescript({ target: 'es6' }),
  ],
  external,
  output: [
    {
      file: pkgjson.module,
      format: 'es',
      banner,
      interop: false,
    },
    {
      file: pkgjson.main,
      format: 'cjs',
      banner,
      interop: false,
    },
  ],
}
