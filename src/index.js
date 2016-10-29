
/* eslint no-console:0 */

import { compile, compileClientWithDependenciesTracked } from 'pug'
import { resolve } from 'path'
import makeFilter from './filter'
import assign from './assign'

// used pug options, note this list does not include 'name'
const PUGPROPS = [
  'filename', 'basedir', 'doctype', 'pretty', 'filters', 'self',
  'debug', 'compileDebug', 'globals', 'inlineRuntimeFunctions'
]

// perform a deep cloning of an object
function clone (obj) {
  if (obj == null || typeof obj != 'object') return obj
  const copy = obj.constructor()
  for (const attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr])
  }
  return copy
}

// deep copy of the properties filtered by list
function cloneProps (src, list) {
  return list.reduce((o, p) => {
    if (p in src) o[p] = clone(src[p])
    return o
  }, {})
}

// rollup-plugin-pug --------------------------------------

export default function pugPlugin (options) {
  if (!options) options = {}

  // prepare extensions to match with the extname() result
  const filter = makeFilter(options, ['.pug', '.jade'])

  // shallow copy options & drop properties unused props
  const config = assign({
    doctype: 'html',
    basedir: process.cwd(),
    compileDebug: false,
    staticPattern: /\.static\.(?:pug|jade)$/,
    locals: {}
  }, options)

  config.inlineRuntimeFunctions = false
  config.pugRuntime = resolve(__dirname, './runtime.es.js')

  return {

    name: 'rollup-plugin-pug',

    resolveId (importee) {
      if (/\0pug-runtime$/.test(importee)) return config.pugRuntime
    },

    transform (code, id) {
      if (!filter(id)) {
        return null
      }

      const opts   = cloneProps(config, PUGPROPS)
      const output = []
      let fn, body

      opts.filename = id

      if (opts.preCompile) {
        fn = compile(code, opts)
        body = JSON.stringify(fn(opts.locals))
      } else {
        fn = compileClientWithDependenciesTracked(code, opts)
        body = fn.body

        if (~body.indexOf('pug.')) {
          output.push('import pug from "\0pug-runtime";')
        }
      }

      const deps = fn.dependencies
      if (deps.length > 1) {
        const ins = {}
        deps.forEach((dep) => {
          if (dep in ins) return
          ins[dep] = 1
          output.push(`import "${dep}";`)
        })
      }

      output.push(`export default ${body}`)

      return output.join('\n') + '\n'
    }

  }
}
