import { render, compileClientWithDependenciesTracked } from 'pug'
import { resolve, dirname } from 'path'
import genPugSourceMap from 'gen-pug-source-map'
import getRuntime from './get-runtime'
import moveImports from './move-imports'
import clonePugOpts from './clone-pug-opts'
import makeFilter from './utils/make-filter'
import assign from './utils/assign'
import clone from './utils/clone'

// rollup-plugin-pug --------------------------------------

export default function pugPlugin (options) {

  // prepare extensions to match with the extname() result
  const filter = makeFilter(options, ['.pug', '.jade'])

  // shallow copy options & drop properties unused props
  const config = assign({
    doctype: 'html',
    compileDebug: false,
    staticPattern: /\.static\.(?:pug|jade)$/,
    inlineRuntimeFunctions: false,
    locals: {}
  }, options)

  config.pugRuntime = getRuntime(config)
  config.sourceMap  = config.sourceMap !== false

  // v1.0.3 add default globals to the user defined set
  const globals = ['String', 'Number', 'Boolean', 'Date', 'Array', 'Function', 'Math', 'RegExp']

  if (config.globals) {
    config.globals.forEach(g => { if (globals.indexOf(g) < 0) globals.push(g) })
  }
  config.globals = globals

  function matchStaticPattern (file) {
    return config.staticPattern && config.staticPattern.test(file)
  }

  return {

    name: 'rollup-plugin-pug',

    options (opts) {
      if (!config.basedir) {
        config.basedir = dirname(resolve(opts.entry || './'))
      }
    },

    resolveId (importee) {
      if (importee === config.runtimeImport && config.pugRuntime) {
        return config.pugRuntime
      }
    },

    transform (code, id) {
      if (!filter(id)) {
        return null
      }

      const is_static = matchStaticPattern(id)
      let opts

      if (is_static) {
        opts = clone(config)
      } else {
        opts = clonePugOpts(config)
      }

      const output = []
      let fn, body, map, keepDbg

      opts.filename = id

      if (is_static) {
        const static_opts = assign(null, config.locals, opts)

        body = `export default ${JSON.stringify(render(code, static_opts))};`

      } else {
        keepDbg = opts.compileDebug
        if (config.sourceMap) {
          opts.compileDebug = map = true
        }
        code = moveImports(code, output)

        fn = compileClientWithDependenciesTracked(code, opts)
        body = fn.body.replace('function template(', '\nexport default function(')

        if (config.runtimeImport && /\bpug\./.test(body)) {
          output.unshift(`import pug from '${config.runtimeImport}';`)
        }

        const deps = fn.dependencies
        if (deps.length) {
          const ins = {}

          deps.forEach((dep) => {
            if (dep in ins) return
            ins[dep] = output.push(`import '${dep}';`)
          })
        }
      }

      output.push(body)

      body = output.join('\n') + ';\n'

      if (map) {
        const bundle = genPugSourceMap(id, body, {
          basedir: opts.basedir,
          keepDebugLines: keepDbg
        })
        return { code: bundle.data, map: bundle.map }
      }

      return body
    }
  }
}
