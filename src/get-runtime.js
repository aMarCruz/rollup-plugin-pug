import { resolve } from 'path'

export default function (config) {
  let runtime = config.inlineRuntimeFunctions ? false : config.pugRuntime

  if (runtime === false) {
    config.runtimeImport = ''
    runtime = ''

  } else if (typeof runtime != 'string') {
    config.runtimeImport = '\0pug-runtime'
    runtime = resolve(__dirname, 'runtime.es.js')

  } else {
    config.runtimeImport = runtime
    runtime = ''
  }

  return runtime
}
