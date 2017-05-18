const RE_IMPORTS = /^([ \t]*-)[ \t]*(import[ \t*{'"].*)/gm

export default function (code, imports) {

  return code.replace(RE_IMPORTS, function (_, indent, _import) {
    _import = _import.trim()
    if (_import.slice(-1) !== ';') _import += ';'
    imports.push(_import)
    return indent
  })

}
