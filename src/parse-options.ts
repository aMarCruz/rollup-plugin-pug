import { resolve } from 'path'

type ParsedOptions = PugPluginOpts &  { _runtimeImport: string }

export function parseOptions (options: Partial<PugPluginOpts>): ParsedOptions {
  options = options || {}

  // Get runtimeImport & pugRuntime values
  let runtimeImport: string
  let pugRuntime = options.inlineRuntimeFunctions ? false : options.pugRuntime

  if (pugRuntime === false) {
    runtimeImport = ''
    pugRuntime = ''

  } else if (typeof pugRuntime != 'string') {
    runtimeImport = '\0pug-runtime'
    pugRuntime = resolve(__dirname, 'runtime.es.js')

  } else {
    runtimeImport = pugRuntime
    pugRuntime = ''
  }

  // v1.0.3 add default globals to the user defined set
  const globals = [
    'Array',
    'Boolean',
    'Date',
    'Function',
    'Math',
    'Number',
    'Object',
    'Promise',
    'RegExp',
    'String',
    'Symbol',
  ]

  // Merge the user globals with the predefined ones
  if (options.globals && Array.isArray(options.globals)) {
    options.globals.forEach((g) => {
      if (globals.indexOf(g) < 0) {
        globals.push(g)
      }
    })
  }

  let basedir = options.basedir
  if (basedir) {
    basedir = resolve(basedir)
  }

  // Shallow copy of user options & defaults
  return {
    doctype: 'html',
    compileDebug: false,
    staticPattern: /\.static\.(?:pug|jade)$/,
    inlineRuntimeFunctions: false,
    locals: {},
    ...options,
    basedir,
    globals,
    _runtimeImport: runtimeImport,
    pugRuntime,
    sourceMap: options.sourceMap !== false,
  }
}
