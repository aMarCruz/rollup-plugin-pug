import { clone } from './utils/clone'

type PugOwnOpts = Pick<PugPluginOpts,
  | 'basedir'
  | 'compileDebug'
  | 'debug'
  | 'doctype'
  | 'filters'
  | 'globals'
  | 'inlineRuntimeFunctions'
  | 'pretty'
  | 'self'> & { filename: string }

// used pug options, note this list does not include 'cache' and 'name'
const PUGPROPS = [
  'basedir',
  'compileDebug',
  'debug',
  'doctype',
  'filters',
  'globals',
  'inlineRuntimeFunctions',
  'pretty',
  'self',
]

/**
 * Retuns a deep copy of the properties filtered by an allowed keywords list
 */
export function clonePugOpts (opts: PugPluginOpts, filename: string): PugOwnOpts {

  return PUGPROPS.reduce((o, p) => {
    if (p in opts) {
      o[p] = clone(opts[p])
    }
    return o
  }, { filename })

}
