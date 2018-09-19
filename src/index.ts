import { compile, compileClientWithDependenciesTracked } from 'pug'
import { resolve, dirname } from 'path'
import genPugSourceMap from 'gen-pug-source-map'
import { parseOptions } from './parse-options'
import { moveImports } from './move-imports'
import { clonePugOpts } from './clone-pug-opts'
import { makeFilter } from './utils/make-filter'
import { arrIfDeps } from './utils/arr-if-deps'
import { assign } from './utils/assign'
import { clone } from './utils/clone'

// typings
import { Plugin, InputOptions, RawSourceMap } from '../node_modules/rollup/dist/rollup'

interface pugFnOrStr {
  (opts: any): string
  body: string
  dependencies: string[]
}

// rollup-plugin-pug --------------------------------------

export default function pugPlugin (options: Partial<PugPluginOpts>) {

  // prepare extensions to match with the extname() result
  const filter = makeFilter(options, ['.pug', '.jade'])

  // Shallow copy of user options & defaults
  const config = parseOptions(options)

  /** Is this a static file? */
  function matchStaticPattern (file: string) {
    return config.staticPattern && config.staticPattern.test(file)
  }

  return {

    name: 'rollup-plugin-pug',

    options (opts: InputOptions) {
      if (!config.basedir) {
        const basedir = opts.input

        // istanbul ignore else
        if (basedir && typeof basedir == 'string') {
          config.basedir = dirname(resolve(basedir))
        } else {
          this.warn('Rollup `input` is not a string, using working dir as `basedir`')
          config.basedir = resolve('.')
        }
      }
    },

    /**
     * Avoid the inclusion of the runtime
     * @param id
     */
    resolveId (id: string) {
      return id === config.runtimeImport && config.pugRuntime || null
    },

    transform (code: string, id: string) {
      if (!filter(id)) {
        return null
      }

      const isStatic = matchStaticPattern(id)
      const pugOpts = clonePugOpts(config, id)
      const output = [] as string[]

      let body: string
      let map: boolean
      let fn: pugFnOrStr

      if (isStatic) {
        const staticOpts = assign(null, config.locals, clone(config))
        staticOpts.filename = id

        fn = compile(code, pugOpts) as pugFnOrStr
        body = `export default ${JSON.stringify(fn(staticOpts))}`

      } else {
        if (config.sourceMap) {
          pugOpts.compileDebug = map = true
        }
        code = moveImports(code, output)

        fn = compileClientWithDependenciesTracked(code, pugOpts) as pugFnOrStr
        body = fn.body.replace('function template(', '\nexport default function(')

        if (config.runtimeImport && /\bpug\./.test(body)) {
          output.unshift(`import pug from '${config.runtimeImport}';`)
        }
      }

      const dependencies = arrIfDeps(fn.dependencies)

      output.push(body)
      body = output.join('\n') + ';\n'

      if (map) {
        const bundle = genPugSourceMap(id, body, {
          basedir: config.basedir,
          keepDebugLines: config.compileDebug,
        })
        return { code: bundle.data, map: bundle.map as RawSourceMap, dependencies }
      }

      return { code: body, map: null, dependencies }
    },
  } as Plugin
}
