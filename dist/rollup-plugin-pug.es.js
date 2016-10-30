import { compileClientWithDependenciesTracked, compile } from 'pug';
import { resolve, dirname, extname } from 'path';
import { createFilter } from 'rollup-pluginutils';

/**
 * Creates a filter for the options `include`, `exclude`, and `extensions`.
 * It filter out names starting with `\0`.
 * Since `extensions` is not a rollup option, I think is widely used.
 *
 * @param {object}       opts - The user options
 * @param {array|string} exts - Default extensions
 * @returns {function}   Filter function that returns true if a given
 *                       file matches the filter.
 */
function makeFilter (opts, exts) {
  if (!opts) { opts = {} }

  var filt = createFilter(opts.include, opts.exclude)

  exts = opts.extensions || exts || '*'
  if (exts !== '*') {
    if (!Array.isArray(exts)) { exts = [exts] }
    exts = exts.map(function (e) { return e[0] !== '.' ? ("." + e) : e })
  }

  return function (id) {
    return filt(id) && (exts === '*' || exts.indexOf(extname(id)) > -1)
  }
}

/**
 * Object.assign like function, but converts falsy `dest` to object.
 *
 * @param   {any} dest - An object or falsy value
 * @returns {Object}   object with merged properties
 */
function assign (dest) {
  var args = arguments

  dest = dest && Object(dest) || {}

  for (var i = 1; i < args.length; i++) {
    var src = args[i]

    if (src) {
      var keys = Object.keys(Object(src))

      for (var j = 0; j < keys.length; j++) {
        var p = keys[j]

        dest[p] = src[p]
      }
    }
  }

  return dest
}

// used pug options, note this list does not include 'name'
var PUGPROPS = [
  'filename', 'basedir', 'doctype', 'pretty', 'filters', 'self',
  'debug', 'compileDebug', 'globals', 'inlineRuntimeFunctions'
]

// perform a deep cloning of an object
function clone (obj) {
  if (obj == null || typeof obj != 'object') { return obj }
  var copy = obj.constructor()
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) { copy[attr] = clone(obj[attr]) }
  }
  return copy
}

// deep copy of the properties filtered by list
function cloneProps (src, list) {
  return list.reduce(function (o, p) {
    if (p in src) { o[p] = clone(src[p]) }
    return o
  }, {})
}

// rollup-plugin-pug --------------------------------------

function pugPlugin (options) {
  if (!options) { options = {} }

  // prepare extensions to match with the extname() result
  var filter = makeFilter(options, ['.pug', '.jade'])

  // shallow copy options & drop properties unused props
  var config = assign({
    doctype: 'html',
    compileDebug: false,
    staticPattern: /\.static\.(?:pug|jade)$/,
    locals: {}
  }, options)

  config.inlineRuntimeFunctions = false
  config.pugRuntime = resolve(__dirname, 'runtime.es.js')

  function matchStaticPattern (file) {
    return config.staticPattern && config.staticPattern.test(file)
  }

  return {

    name: 'rollup-plugin-pug',

    options: function options$1 (opts) {
      if (!config.basedir) {
        config.basedir = dirname(resolve(opts.entry || '~'))
      }
    },

    resolveId: function resolveId (importee) {
      if (/\0pug-runtime$/.test(importee)) { return config.pugRuntime }
    },

    transform: function transform (code, id) {
      if (!filter(id)) {
        return null
      }

      var opts   = cloneProps(config, PUGPROPS)
      var output = []
      var fn, body

      opts.filename = id

      if (matchStaticPattern(id)) {
        fn = compile(code, opts)
        body = JSON.stringify(fn(config.locals))

      } else {
        fn = compileClientWithDependenciesTracked(code, opts)
        body = fn.body.replace('function template(', 'function(')

        if (/\bpug\./.test(body)) {
          output.push('import pug from "\0pug-runtime";')
        }
      }

      var deps = fn.dependencies
      if (deps.length > 1) {
        var ins = {}

        deps.forEach(function (dep) {
          if (dep in ins) { return }
          ins[dep] = output.push(("import \"" + dep + "\";"))
        })
      }

      output.push(("export default " + body))

      return output.join('\n') + '\n'
    }
  }
}

export default pugPlugin;
//# sourceMappingURL=rollup-plugin-pug.es.js.map
