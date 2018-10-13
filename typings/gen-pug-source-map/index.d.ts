declare module "gen-pug-source-map" {

  interface PugRawSourceMap {
    version: string
    sources: string[]
    names: string[]
    sourceRoot?: string
    sourcesContent?: string[]
    mappings: string
    file: string
  }

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
    map: PugRawSourceMap,
  }

  export = genPugSourceMap
}
