import { compile, compileClientWithDependenciesTracked } from 'pug'
import { resolve, dirname } from 'path'
import genPugSourceMap from 'gen-pug-source-map'
import { parseOptions } from './parse-options'
import { moveImports } from './move-imports'
import { clonePugOpts } from './clone-pug-opts'
import { makeFilter } from './utils/make-filter'
import { arrIfDeps } from './utils/arr-if-deps'

// typings
import { Plugin, InputOptions } from '../node_modules/rollup/dist/rollup'

interface pugFnOrStr {
  (opts: any): string
  body: string
  dependencies: string[]
}

//#region Plugin -------------------------------------------------------------

export default function pugPlugin (options: Partial<PugPluginOpts>): Plugin {

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
      return id === config._runtimeImport && config.pugRuntime || null
    },

    transform (code: string, id: string) {
      if (!filter(id)) {
        return null
      }

      const isStatic = matchStaticPattern(id)
      const pugOpts = clonePugOpts(config, id)

      let body: string
      let map: boolean
      let fn: pugFnOrStr

      if (isStatic) {
        /*
          This template is executed now and, at runtime, will be loaded through
          `import` so it will not have access to runtime variables or methods.
          Instead, we use here the `local` variables and the compile-time options.
        */
        const staticOpts = { ...config.locals, ...config, filename: id }

        fn = compile(code, pugOpts) as pugFnOrStr
        body = fn(staticOpts)
        body = `export default ${JSON.stringify(body)};\n`

      } else {
        /*
          This template will generate a module with a function to be executed at
          runtime. It will be user responsibility to pass the correct parameters
          to the function, here we only take care of the `imports`, incluiding the
          pug runtime.
        */
        const imports = [] as string[]

        if (config.sourceMap) {
          pugOpts.compileDebug = map = true
        }

        // move the imports from the template to the top of the output queue
        code = moveImports(code, imports)

        // get function body and dependencies
        fn = compileClientWithDependenciesTracked(code, pugOpts) as pugFnOrStr
        body = fn.body.replace('function template(', '\nexport default function(')

        // put the pung-runtime import as the first of the queue, if neccesary
        if (config._runtimeImport && /\bpug\./.test(body)) {
          imports.unshift(`import pug from '${config._runtimeImport}';`)
        }

        // convert imports into string and add the template function
        body = imports.join('\n') + `${body};\n`
      }

      const dependencies = arrIfDeps(fn.dependencies)

      if (map) {
        const bundle = genPugSourceMap(id, body, {
          basedir: config.basedir,
          keepDebugLines: config.compileDebug,
        })

        // HACK: 'as any' to avoid conflict with wrong rollup 6.6 typings
        return { code: bundle.data, map: bundle.map as any, dependencies }
      }

      return { code: body, map: null, dependencies }
    },
  }
}

//#endregion
