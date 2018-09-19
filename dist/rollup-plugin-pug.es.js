/**
 * rollup-plugin-pug v1.0.0
 * @author aMarCruz'
 * @license MIT'
 */
import { resolve, extname, dirname } from 'path';
import { createFilter } from 'rollup-pluginutils';
import { compile, compileClientWithDependenciesTracked } from 'pug';
import genPugSourceMap from 'gen-pug-source-map';

/**
 * Object.assign like function, but always converts falsy `dest` to object.
 *
 * @param dest - An object or falsy value
 * @returns Object with merged properties
 */
const assign = (dest, ...args) => {
    dest = dest ? Object(dest) : {};
    for (let i = 0; i < args.length; i++) {
        const src = args[i];
        // istanbul ignore else
        if (src) {
            const keys = Object.keys(src);
            for (let j = 0; j < keys.length; j++) {
                const p = keys[j];
                dest[p] = src[p];
            }
        }
    }
    return dest;
};

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
        pugRuntime = resolve(__dirname, 'runtime.es.js');
    }
    else {
        runtimeImport = pugRuntime;
        pugRuntime = '';
    }
    // v1.0.3 add default globals to the user defined set
    const globals = ['String', 'Number', 'Boolean', 'Date', 'Array', 'Function', 'Math', 'RegExp'];
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
        basedir = resolve(basedir);
    }
    // Shallow copy of user options & defaults
    return assign({
        doctype: 'html',
        compileDebug: false,
        staticPattern: /\.static\.(?:pug|jade)$/,
        inlineRuntimeFunctions: false,
        locals: {},
    }, options, {
        basedir,
        globals,
        runtimeImport,
        pugRuntime,
        sourceMap: options.sourceMap !== false,
    });
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
    const filter = createFilter(opts.include, opts.exclude);
    exts = opts.extensions || exts;
    if (!exts || exts === '*') {
        return filter;
    }
    if (!Array.isArray(exts)) {
        exts = [exts];
    }
    // Create the normalized extension list
    const extensions = exts.map((e) => (e[0] !== '.' ? `.${e}` : e));
    return (id) => filter(id) && extensions.indexOf(extname(id)) > -1;
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

// rollup-plugin-pug --------------------------------------
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
                let basedir = opts.input;
                // istanbul ignore else
                if (basedir && typeof basedir == 'string') {
                    config.basedir = dirname(resolve(basedir));
                }
                else {
                    this.warn('Rollup `input` is not a string, using working dir as `basedir`');
                    config.basedir = resolve('.');
                }
            }
        },
        /**
         * Avoid the inclusion of the runtime
         * @param id
         */
        resolveId(id) {
            return id === config.runtimeImport && config.pugRuntime || null;
        },
        transform(code, id) {
            if (!filter(id)) {
                return null;
            }
            const isStatic = matchStaticPattern(id);
            const pugOpts = clonePugOpts(config, id);
            const output = [];
            let body;
            let map;
            let fn;
            if (isStatic) {
                const staticOpts = assign(null, config.locals, clone(config));
                staticOpts.filename = id;
                fn = compile(code, pugOpts);
                body = `export default ${JSON.stringify(fn(staticOpts))}`;
            }
            else {
                if (config.sourceMap) {
                    pugOpts.compileDebug = map = true;
                }
                code = moveImports(code, output);
                fn = compileClientWithDependenciesTracked(code, pugOpts);
                body = fn.body.replace('function template(', '\nexport default function(');
                if (config.runtimeImport && /\bpug\./.test(body)) {
                    output.unshift(`import pug from '${config.runtimeImport}';`);
                }
            }
            const dependencies = arrIfDeps(fn.dependencies);
            output.push(body);
            body = output.join('\n') + ';\n';
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

export default pugPlugin;
