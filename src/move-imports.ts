const RE_IMPORTS = /^([ \t]*-)[ \t]*(import[ \t*{'"].*)/gm

/**
 * Adds an import directive to the collected imports.
 *
 * @param code Procesing code
 * @param imports Collected imports
 */
export function moveImports (code: string, imports: string[]) {

  return code.replace(RE_IMPORTS, function (_, indent: string, imprt: string) {
    imprt = imprt.trim()

    if (imprt.slice(-1) !== ';') {
      imprt += ';'
    }

    imports.push(imprt)
    return indent   // keep only the indentation
  })

}
