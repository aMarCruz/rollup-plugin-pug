'use strict';

var pug = require('pug');
var path = require('path');
var rollupPluginutils = require('rollup-pluginutils');

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

  var filt = rollupPluginutils.createFilter(opts.include, opts.exclude)

  exts = opts.extensions || exts || '*'
  if (exts !== '*') {
    if (!Array.isArray(exts)) { exts = [exts] }
    exts = exts.map(function (e) { return e[0] !== '.' ? ("." + e) : e })
  }

  return function (id) {
    return filt(id) && (exts === '*' || exts.indexOf(path.extname(id)) > -1)
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

/* eslint no-console:0 */

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
    basedir: process.cwd(),
    compileDebug: false,
    locals: {}
  }, options)

  config.inlineRuntimeFunctions = false

  if (!config.preCompile) {
    config.pugRuntime = path.resolve(__dirname, './runtime.es.js')
  }

  return {

    name: 'rollup-plugin-pug',

    resolveId: function resolveId (importee, importer) {
      console.log(("ìmportee: " + importee + ", importer: " + importer)) //eslint-disable-line
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

      if (opts.preCompile) {
        fn = pug.compile(code, opts)
        body = JSON.stringify(fn(opts.locals))
      } else {
        fn = pug.compileClientWithDependenciesTracked(code, opts)
        body = fn.body

        if (~body.indexOf('pug.')) {
          output.push('import pug from "\0pug-runtime";')
        }
      }

      var deps = fn.dependencies
      if (deps.length > 1) {
        var ins = {}
        deps.forEach(function (dep) {
          if (dep in ins) { return }
          ins[dep] = 1
          output.push(("import \"" + dep + "\";"))
        })
      }

      output.push(("export default " + body))

      return output.join('\n') + '\n'
    }

  }
}

module.exports = pugPlugin;
//# sourceMappingURL=rollup-plugin-pug.js.map
