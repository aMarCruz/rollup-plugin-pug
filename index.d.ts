// Pug options
declare type PugOwnOpts = {
  /**
   * The root directory of all absolute inclusion.
   *
   * It defaults to the Rollup `input` option if it is a string, or the current
   * working directory if `input` is anything else.
   */
  basedir?: string,
  /**
   * If set to `true`, the function source will be included in the compiled
   * template for better error messages (sometimes useful in development).
   * It is enabled by default, unless used with Express in production mode.
   * @default false
   */
  compileDebug: boolean,
  /**
   * If set to `true`, the tokens and function body are logged to stdout.
   * @default false
   */
  debug?: boolean,
  /**
   * If the `doctype` is not specified as part of the template, this value will be used.
   * It is sometimes useful to get self-closing tags and remove mirroring of boolean attributes.
   * See [doctype documentation](https://pugjs.org/language/doctype.html#doctype-option) for more information.
   * @default "html"
   */
  doctype: string,
  /**
   * Do not use, this will be overwritten with the full path of the file
   * being compiled.
   */
  filename?: string,
  /**
   * Hash table of [custom filters](https://pugjs.org/language/filters.html#custom-filters).
   * @default undefined
   */
  filters?: object,
  /**
   * List of global names to make accessible in templates.
   *
   * _NOTE: The default ones with be merged with your globals, if any._
   * @default ['String', 'Number', 'Boolean', 'Date', 'Array', 'Function', 'Math', 'RegExp']
   */
  globals: string[],
  /**
   * Inline runtime functions instead of `import`-ing them from a shared version.
   * @default false
   */
  inlineRuntimeFunctions: boolean,
  /**
   * Adds whitespace to the resulting HTML to make it easier for a human to read using `'  '`
   * as indentation. If a string is specified, that will be used as indentation instead
   * (e.g. `'\t'`).
   *
   * We strongly recommend against using this option. Too often, it creates
   * subtle bugs in your templates because of the way it alters the interpretation and
   * rendering of whitespace, and so this feature is going to be removed.
   * @deprecated
   */
  pretty?: boolean | string,
  /**
   * Use a `self` namespace to hold the locals. It will speed up the compilation, but
   * instead of writing variable you will have to write `self.variable` to access a
   * property of the locals object.
   * @default false
   */
  self?: boolean,
}

// Rollup & plugin options
declare type PugPluginOpts = PugOwnOpts & {
  /**
   * [minimatch](https://www.npmjs.com/package/minimatch) or array of minimatch
   * with files that should be included by default.
   * @default undefined
   */
  include?: string | string[],
  /**
   * [minimatch](https://www.npmjs.com/package/minimatch) or array of minimatch
   * with files that should be excluded by default.
   * @default undefined
   */
  exclude?: string | string[],
  /**
   * Array of extensions to process (don't use wildcards here).
   * @default ['.pug', '.jade']
   */
  extensions?: string[],
  /**
   * Plain JavaScript object with values passed to the compiler for _static_ compilation.
   * @default {}
   * @deprecated since v1.0.1
   */
  locals: { [k: string]: any },
  /**
   * Custom Pug runtime filename.
   * This option can be set to `false` to avoid importing the runtime, but you must
   * provide an equivalent `import` accessible to the template.
   * @default "./node_modules/rollup-plugin-pug/runtime.es.js"
   */
  pugRuntime: string,
  /**
   * _Internal use_
   */
  runtimeImport: string,
  /**
   * Honors the Rollup `sourceMap` option.
   * @default true
   */
  sourceMap: boolean,
  /**
   * Regex for files to compile and evaluate at build time to export plain HTML.
   * @default /\.static\.(?:pug|jade)$/
   */
  staticPattern: RegExp,
}

declare module "rollup-plugin-pug" {
  const plugin: (options: PugPluginOpts) => import('./node_modules/rollup/dist/rollup').Plugin
  export default plugin
}
