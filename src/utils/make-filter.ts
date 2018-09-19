import { createFilter } from 'rollup-pluginutils'
import { extname } from 'path'

/**
 * Creates a filter for the options `include`, `exclude`, and `extensions`.
 * It filter out names starting with `\0`.
 * Since `extensions` is not a rollup option, I think is widely used.
 *
 * @param opts - User options
 * @param exts - Default extensions
 * @returns Filter function that returns true if a given file matches the filter.
 */
export const makeFilter = (opts: Partial<PugPluginOpts>, exts: string | string[]) => {
  opts = opts || {}

  // Create the rollup default filter
  const filter: (id: string) => boolean = createFilter(opts.include, opts.exclude)

  exts = opts.extensions || exts
  if (!exts || exts === '*') {
    return filter
  }

  if (!Array.isArray(exts)) {
    exts = [exts]
  }

  // Create the normalized extension list
  const extensions = exts.map((e) => (e[0] !== '.' ? `.${e}` : e))

  return (id: string) => filter(id) && extensions.indexOf(extname(id)) > -1
}
