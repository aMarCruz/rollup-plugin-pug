'use strict';

var rollupPluginutils = require('rollup-pluginutils');
var pug = require('pug');
var path = require('path');

function pug$1 (options) {
  if (!options) options = {};

  var EXCL_PROPS = ['extensions', 'include', 'exclude'];

  // prepare extensions to match with the extname() result
  function normalizeExtensions (exts) {
    if (exts) {
      for (var i = 0; i < exts.length; i++) {
        var ext = exts[i].toLowerCase();
        exts[i] = ext[0] !== '.' ? '.' + ext : ext;
      }
    } else {
      exts = ['.jade', '.pug'];
    }
    return exts;
  }

  // clone options & drop properties not necessary for pug compiler
  function normalizeOptions (opts) {
    var dest = {
      doctype: 'html',
      name: 'template',
      compileDebug: false,
      inlineRuntimeFunctions: false
    };
    for (var p in opts) {
      if (opts.hasOwnProperty(p) && EXCL_PROPS.indexOf(p) === -1) {
        dest[p] = opts[p];
      }
    }
    dest.globals = ['require'].concat(opts.globals || []);

    return dest;
  }

  var extensions = normalizeExtensions(options.extensions);
  var filter = rollupPluginutils.createFilter(options.include, options.exclude);
  var opts = normalizeOptions(options);

  return {
    transform (code, id) {
      if (filter(id) && ~extensions.indexOf(path.extname(id).toLowerCase())) {
        opts.filename = id;
        return 'import pug from "pug-runtime";\n' +
          'export default ' + pug.compileClient(code, opts);
      }
      return null;
    },
    name: 'rollup-plugin-pug'
  };
}

module.exports = pug$1;