/**
 * Retuns an array of unique elements of `inArr` or undefined if inArr is empty.
 * @param inArr Array of string
 */
// eslint-disable-next-line consistent-return
export const arrIfDeps = (inArr: string[]) => {
  if (inArr && inArr.length) {
    const outArr = [] as string[]

    inArr.forEach((str) => {
      if (outArr.indexOf(str) < 0) {
        outArr.push(str)
      }
    })

    return outArr
  }
}
