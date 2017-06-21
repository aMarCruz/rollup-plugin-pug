import clone from './utils/clone'

// used pug options, note this list does not include 'cache' and 'name'
const PUGPROPS = [
  'filename', 'basedir', 'doctype', 'pretty', 'filters', 'self',
  'debug', 'compileDebug', 'globals', 'inlineRuntimeFunctions'
]

// deep copy of the properties filtered by list
export default function (src) {

  return PUGPROPS.reduce((o, p) => {
    if (p in src) o[p] = clone(src[p])
    return o
  }, {})

}
