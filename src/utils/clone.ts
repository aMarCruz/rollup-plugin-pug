/**
 * Perform a deep cloning of an object (enumerable properties).
 *
 * @param obj - The object to clone
 * @returns A new object.
 */
export const clone = <T>(obj: T) => {

  if (obj == null || typeof obj != 'object') {
    return obj  // not an object, return as is
  }

  const copy: T = obj.constructor()

  for (const attr in obj) {
    // istanbul ignore else
    if (Object.hasOwnProperty.call(obj, attr)) {
      copy[attr] = clone(obj[attr])
    }
  }

  return copy
}
