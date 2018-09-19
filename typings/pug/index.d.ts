declare module "pug" {
  export const render: (templ: string, options?: any, fn?: any) => string

  export const compile: (templ: string, options?: any) => {
    (locals: any): string,
    dependencies: string[]
  }

  export const compileClientWithDependenciesTracked: (templ: string, options?: any) => {
    body: string,
    dependencies: string[],
  }
}
