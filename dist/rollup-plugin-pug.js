/**
 * rollup-plugin-pug v1.0.1
 * @author aMarCruz'
 * @license MIT'
 */
'use strict';

var path = require('path');
var rollupPluginutils = require('rollup-pluginutils');
var pug = require('pug');
var genPugSourceMap = require('gen-pug-source-map');

function parseOptions(options) {
    options = options || {};
    // Get runtimeImport & pugRuntime values
    let runtimeImport;
    let pugRuntime = options.inlineRuntimeFunctions ? false : options.pugRuntime;
    if (pugRuntime === false) {
        runtimeImport = '';
        pugRuntime = '';
    }
    else if (typeof pugRuntime != 'string') {
        runtimeImport = '\0pug-runtime';
        pugRuntime = path.resolve(__dirname, 'runtime.es.js');
    }
    else {
        runtimeImport = pugRuntime;
        pugRuntime = '';
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
        'RegExp',
        'String',
        'Symbol',
    ];
    // Merge the user globals with the predefined ones
    if (options.globals && Array.isArray(options.globals)) {
        options.globals.forEach((g) => {
            if (globals.indexOf(g) < 0) {
                globals.push(g);
            }
        });
    }
    let basedir = options.basedir;
    if (basedir) {
        basedir = path.resolve(basedir);
    }
    // Shallow copy of user options & defaults
    return Object.assign({ doctype: 'html', compileDebug: false, staticPattern: /\.static\.(?:pug|jade)$/, inlineRuntimeFunctions: false, locals: {} }, options, { basedir,
        globals, _runtimeImport: runtimeImport, pugRuntime, sourceMap: options.sourceMap !== false });
}

const RE_IMPORTS = /^([ \t]*-)[ \t]*(import[ \t*{'"].*)/gm;
/**
 * Adds an import directive to the collected imports.
 *
 * @param code Procesing code
 * @param imports Collected imports
 */
function moveImports(code, imports) {
    return code.replace(RE_IMPORTS, function (_, indent, imprt) {
        imprt = imprt.trim();
        if (imprt.slice(-1) !== ';') {
            imprt += ';';
        }
        imports.push(imprt);
        return indent; // keep only the indentation
    });
}

/**
 * Perform a deep cloning of an object (enumerable properties).
 *
 * @param obj - The object to clone
 * @returns A new object.
 */
const clone = (obj) => {
    if (obj == null || typeof obj != 'object') {
        return obj; // not an object, return as is
    }
    const copy = obj.constructor();
    for (const attr in obj) {
        // istanbul ignore else
        if (Object.hasOwnProperty.call(obj, attr)) {
            copy[attr] = clone(obj[attr]);
        }
    }
    return copy;
};

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
];
/**
 * Retuns a deep copy of the properties filtered by an allowed keywords list
 */
function clonePugOpts(opts, filename) {
    return PUGPROPS.reduce((o, p) => {
        if (p in opts) {
            o[p] = clone(opts[p]);
        }
        return o;
    }, { filename });
}

/**
 * Creates a filter for the options `include`, `exclude`, and `extensions`.
 * It filter out names starting with `\0`.
 * Since `extensions` is not a rollup option, I think is widely used.
 *
 * @param opts - User options
 * @param exts - Default extensions
 * @returns Filter function that returns true if a given file matches the filter.
 */
const makeFilter = (opts, exts) => {
    opts = opts || {};
    // Create the rollup default filter
    const filter = rollupPluginutils.createFilter(opts.include, opts.exclude);
    exts = opts.extensions || exts;
    if (!exts || exts === '*') {
        return filter;
    }
    if (!Array.isArray(exts)) {
        exts = [exts];
    }
    // Create the normalized extension list
    const extensions = exts.map((e) => (e[0] !== '.' ? `.${e}` : e));
    return (id) => (filter(id) && extensions.indexOf(path.extname(id)) > -1);
};

/**
 * Retuns an array of unique elements of `inArr` or undefined if inArr is empty.
 * @param inArr Array of string
 */
// eslint-disable-next-line consistent-return
const arrIfDeps = (inArr) => {
    if (inArr && inArr.length) {
        const outArr = [];
        inArr.forEach((str) => {
            if (outArr.indexOf(str) < 0) {
                outArr.push(str);
            }
        });
        return outArr;
    }
};

function pugPlugin(options) {
    // prepare extensions to match with the extname() result
    const filter = makeFilter(options, ['.pug', '.jade']);
    // Shallow copy of user options & defaults
    const config = parseOptions(options);
    /** Is this a static file? */
    function matchStaticPattern(file) {
        return config.staticPattern && config.staticPattern.test(file);
    }
    return {
        name: 'rollup-plugin-pug',
        options(opts) {
            if (!config.basedir) {
                const basedir = opts.input;
                // istanbul ignore else
                if (basedir && typeof basedir == 'string') {
                    config.basedir = path.dirname(path.resolve(basedir));
                }
                else {
                    this.warn('Rollup `input` is not a string, using working dir as `basedir`');
                    config.basedir = path.resolve('.');
                }
            }
        },
        /**
         * Avoid the inclusion of the runtime
         * @param id
         */
        resolveId(id) {
            return id === config._runtimeImport && config.pugRuntime || null;
        },
        transform(code, id) {
            if (!filter(id)) {
                return null;
            }
            const isStatic = matchStaticPattern(id);
            const pugOpts = clonePugOpts(config, id);
            let body;
            let map;
            let fn;
            if (isStatic) {
                /*
                  This template is executed now and, at runtime, will be loaded through
                  `import` so it will not have access to runtime variables or methods.
                  Instead, we use here the `local` variables and the compile-time options.
                */
                const staticOpts = Object.assign({}, config.locals, config, { filename: id });
                fn = pug.compile(code, pugOpts);
                body = fn(staticOpts);
                body = `export default ${JSON.stringify(body)};\n`;
            }
            else {
                /*
                  This template will generate a module with a function to be executed at
                  runtime. It will be user responsibility to pass the correct parameters
                  to the function, here we only take care of the `imports`, incluiding the
                  pug runtime.
                */
                const imports = [];
                if (config.sourceMap) {
                    pugOpts.compileDebug = map = true;
                }
                // move the imports from the template to the top of the output queue
                code = moveImports(code, imports);
                // get function body and dependencies
                fn = pug.compileClientWithDependenciesTracked(code, pugOpts);
                body = fn.body.replace('function template(', '\nexport default function(');
                // put the pung-runtime import as the first of the queue, if neccesary
                if (config._runtimeImport && /\bpug\./.test(body)) {
                    imports.unshift(`import pug from '${config._runtimeImport}';`);
                }
                // convert imports into string and add the template function
                body = imports.join('\n') + `${body};\n`;
            }
            const dependencies = arrIfDeps(fn.dependencies);
            if (map) {
                const bundle = genPugSourceMap(id, body, {
                    basedir: config.basedir,
                    keepDebugLines: config.compileDebug,
                });
                return { code: bundle.data, map: bundle.map, dependencies };
            }
            return { code: body, map: null, dependencies };
        },
    };
}
//#endregion

module.exports = pugPlugin;
