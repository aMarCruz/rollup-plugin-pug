declare module "rollup-pluginutils" {
  export const createFilter: (
    include: string | string[] | undefined,
    exclude: string | string[] | undefined) => (id: string) => boolean
}
