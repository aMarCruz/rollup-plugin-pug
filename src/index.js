import { compile, compileClientWithDependenciesTracked } from 'pug'
import { resolve, dirname } from 'path'
import genSourceMap from 'gen-pug-source-map'
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
    compileDebug: false,
    staticPattern: /\.static\.(?:pug|jade)$/,
    locals: {}
  }, options)


  config.inlineRuntimeFunctions = false
  config.pugRuntime     = resolve(__dirname, 'runtime.es.js')
  config.sourceMap      = config.sourceMap !== false

  function matchStaticPattern (file) {
    return config.staticPattern && config.staticPattern.test(file)
  }

  return {

    name: 'rollup-plugin-pug',

    options (opts) {
      if (!config.basedir) {
        config.basedir = dirname(resolve(opts.entry || '~'))
      }
    },

    resolveId (importee) {
      if (/\0pug-runtime$/.test(importee)) return config.pugRuntime
    },

    transform (code, id) {
      if (!filter(id)) {
        return null
      }

      const opts   = cloneProps(config, PUGPROPS)
      const output = []

      let fn, body, map, keepDbg

      opts.filename = id

      if (matchStaticPattern(id)) {
        fn = compile(code, opts)
        body = JSON.stringify(fn(config.locals))

      } else {
        keepDbg = opts.compileDebug
        if (config.sourceMap) opts.compileDebug = map = true

        fn = compileClientWithDependenciesTracked(code, opts)
        body = fn.body.replace('function template(', 'function(')

        if (/\bpug\./.test(body)) {
          output.push('import pug from "\0pug-runtime";')
        }
      }

      const deps = fn.dependencies
      if (deps.length > 1) {
        const ins = {}

        deps.forEach((dep) => {
          if (dep in ins) return
          ins[dep] = output.push(`import "${dep}";`)
        })
      }

      output.push(`export default ${body}`)

      body = output.join('\n') + '\n'

      if (map) {
        const bundle = genSourceMap(id, body, {
          basedir: opts.basedir,
          keepDebugLines: keepDbg
        })
        return { code: bundle.data, map: bundle.map }
      }

      return body
    }
  }
}
