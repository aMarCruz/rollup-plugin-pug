declare module "gen-pug-source-map" {

  interface PugSourceMapOpts {
    /**
     * Define the root directory of the source files for using relative names.
     * This is the same value that you pass to the Pug compiler.
     * @default: current working directory
     */
    basedir?: string
    /**
     * If `true`, keep debugging information in the generated code.
     * @default false
     */
    keepDebugLines?: boolean
    /**
     * If `true`, do not include the original source(s) in the source map.
     * @default false
     */
    excludeContent?: boolean
  }

  const genPugSourceMap: (
    compiledFileName: string,
    compiled: string,
    options?: PugSourceMapOpts
  ) => {
    data: string,
    map: object,
  }

  export = genPugSourceMap
}
