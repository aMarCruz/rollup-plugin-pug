/**
 * Object.assign like function, but always converts falsy `dest` to object.
 *
 * @param dest - An object or falsy value
 * @returns Object with merged properties
 */
export const assign = <T, V>(dest: T, ...args: V[]) => {
  dest = dest ? Object(dest) : {}

  for (let i = 0; i < args.length; i++) {
    const src = args[i]

    // istanbul ignore else
    if (src) {
      const keys = Object.keys(src)

      for (let j = 0; j < keys.length; j++) {
        const p = keys[j]

        dest[p] = src[p]
      }
    }
  }

  return dest as T & V
}
