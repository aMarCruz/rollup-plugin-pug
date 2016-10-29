/**
 * Object.assign like function, but converts falsy `dest` to object.
 *
 * @param   {any} dest - An object or falsy value
 * @returns {Object}   object with merged properties
 */
export default function assign (dest) {
  const args = arguments

  dest = dest && Object(dest) || {}

  for (let i = 1; i < args.length; i++) {
    const src = args[i]

    if (src) {
      const keys = Object.keys(Object(src))

      for (let j = 0; j < keys.length; j++) {
        const p = keys[j]

        dest[p] = src[p]
      }
    }
  }

  return dest
}
