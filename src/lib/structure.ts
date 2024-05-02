export interface Releases {
  [key: string]: Release;
}

export interface Release {
  openconfig: boolean
  features: boolean
}

export interface HomeGroup {
  [key: string]: {
    top: string[],
    others: string[],
    all: {
      [key: string]: string[]
    }
  }
}

export interface Model {
  title: string, 
  path: string
}

export interface PayLoad {
  model: string,
  modelTitle: string, 
  release: string,
  allModels: Model[],
  paths: string[],
  urlPath: string,
  features: Platforms
}

export interface Platforms {
  [key: string]: string
}

export interface PlatformFeatures {
  [key: string]: string[]
}

export interface TreePayLoad {
  urlPath: string,
  crossLaunched: boolean,
  model: string,
  modelTitle: string, 
  release: string,
  allModels: Model[],
  paths: string[],
}

export interface PathDef {
  path: string,
  "path-with-prefix": string,
  type: string,
  "enum-values"?: string[],
  description: string,
  default?: string,
  namespace?: string,
  "if-features": string[]
}