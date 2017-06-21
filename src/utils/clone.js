/**
 * Perform a deep cloning of an object (enumerable properties).
 *
 * @param {any} obj - The object to clone
 * @returns {object} A new object.
 */
export default function clone (obj) {

  if (obj == null || typeof obj != 'object') {
    return obj  // not an object, return as is
  }

  const copy = obj.constructor()

  for (const attr in obj) {
    if (obj.hasOwnProperty(attr)) {
      copy[attr] = clone(obj[attr])
    }
  }

  return copy
}
