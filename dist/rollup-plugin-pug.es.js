import { compileClientWithDependenciesTracked, render } from 'pug';
import { dirname, extname, resolve } from 'path';
import genPugSourceMap from 'gen-pug-source-map';
import { createFilter } from 'rollup-pluginutils';

var getRuntime = function (config) {
  var runtime = config.inlineRuntimeFunctions ? false : config.pugRuntime;

  if (runtime === false) {
    config.runtimeImport = '';
    runtime = '';

  } else if (typeof runtime != 'string') {
    config.runtimeImport = '\0pug-runtime';
    runtime = resolve(__dirname, 'runtime.es.js');

  } else {
    config.runtimeImport = runtime;
    runtime = '';
  }

  return runtime
};

var RE_IMPORTS = /^([ \t]*-)[ \t]*(import[ \t*{'"].*)/gm;

var moveImports = function (code, imports) {

  return code.replace(RE_IMPORTS, function (_, indent, _import) {
    _import = _import.trim();
    if (_import.slice(-1) !== ';') { _import += ';'; }
    imports.push(_import);
    return indent
  })

};

/**
 * Perform a deep cloning of an object (enumerable properties).
 *
 * @param {any} obj - The object to clone
 * @returns {object} A new object.
 */
function clone (obj) {

  if (obj == null || typeof obj != 'object') {
    return obj  // not an object, return as is
  }

  var copy = obj.constructor();

  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) {
      copy[attr] = clone(obj[attr]);
    }
  }

  return copy
}

// used pug options, note this list does not include 'cache' and 'name'
var PUGPROPS = [
  'filename', 'basedir', 'doctype', 'pretty', 'filters', 'self',
  'debug', 'compileDebug', 'globals', 'inlineRuntimeFunctions'
];

// deep copy of the properties filtered by list
var clonePugOpts = function (src) {

  return PUGPROPS.reduce(function (o, p) {
    if (p in src) { o[p] = clone(src[p]); }
    return o
  }, {})

};

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
  if (!opts) { opts = {}; }

  var filt = createFilter(opts.include, opts.exclude);

  exts = opts.extensions || exts;

  if (!exts || exts === '*') {
    return filt
  }

  if (!Array.isArray(exts)) { exts = [exts]; }
  exts = exts.map(function (e) { return e[0] !== '.' ? ("." + e) : e });

  return function (id) {
    return filt(id) && exts.indexOf(extname(id)) > -1
  }
}

/**
 * Object.assign like function, but always converts falsy `dest` to object.
 *
 * @param   {any} dest - An object or falsy value
 * @returns {Object}   object with merged properties
 */
function assign (dest) {
  var args = arguments;

  dest = dest ? Object(dest) : {};

  for (var i = 1; i < args.length; i++) {
    var src = args[i];

    if (src) {
      var keys = Object.keys(src);

      for (var j = 0; j < keys.length; j++) {
        var p = keys[j];

        dest[p] = src[p];
      }
    }
  }

  return dest
}

// rollup-plugin-pug --------------------------------------

function pugPlugin (options) {

  // prepare extensions to match with the extname() result
  var filter = makeFilter(options, ['.pug', '.jade']);

  // shallow copy options & drop properties unused props
  var config = assign({
    doctype: 'html',
    compileDebug: false,
    staticPattern: /\.static\.(?:pug|jade)$/,
    inlineRuntimeFunctions: false,
    locals: {}
  }, options);

  config.pugRuntime = getRuntime(config);
  config.sourceMap  = config.sourceMap !== false;

  // v1.0.3 add default globals to the user defined set
  var globals = ['String', 'Number', 'Boolean', 'Date', 'Array', 'Function', 'Math', 'RegExp'];

  if (config.globals) {
    config.globals.forEach(function (g) { if (globals.indexOf(g) < 0) { globals.push(g); } });
  }
  config.globals = globals;

  function matchStaticPattern (file) {
    return config.staticPattern && config.staticPattern.test(file)
  }

  return {

    name: 'rollup-plugin-pug',

    options: function options (opts) {
      if (!config.basedir) {
        config.basedir = dirname(resolve(opts.entry || './'));
      }
    },

    resolveId: function resolveId (importee) {
      if (importee === config.runtimeImport && config.pugRuntime) {
        return config.pugRuntime
      }
    },

    transform: function transform (code, id) {
      if (!filter(id)) {
        return null
      }

      var is_static = matchStaticPattern(id);
      var opts;

      if (is_static) {
        opts = clone(config);
      } else {
        opts = clonePugOpts(config);
      }

      var output = [];
      var fn, body, map, keepDbg;

      opts.filename = id;

      if (is_static) {
        var static_opts = assign(null, config.locals, opts);

        body = "export default " + (JSON.stringify(render(code, static_opts))) + ";";

      } else {
        keepDbg = opts.compileDebug;
        if (config.sourceMap) {
          opts.compileDebug = map = true;
        }
        code = moveImports(code, output);

        fn = compileClientWithDependenciesTracked(code, opts);
        body = fn.body.replace('function template(', '\nexport default function(');

        if (config.runtimeImport && /\bpug\./.test(body)) {
          output.unshift(("import pug from '" + (config.runtimeImport) + "';"));
        }

        var deps = fn.dependencies;
        if (deps.length) {
          var ins = {};

          deps.forEach(function (dep) {
            if (dep in ins) { return }
            ins[dep] = output.push(("import '" + dep + "';"));
          });
        }
      }

      output.push(body);

      body = output.join('\n') + ';\n';

      if (map) {
        var bundle = genPugSourceMap(id, body, {
          basedir: opts.basedir,
          keepDebugLines: keepDbg
        });
        return { code: bundle.data, map: bundle.map }
      }

      return body
    }
  }
}

export default pugPlugin;
//# sourceMappingURL=rollup-plugin-pug.es.js.map
