export interface Releases {
  [key: string]: Release
}

export interface Release {
  openconfig: boolean
  features: boolean
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
  urlPath: string,
  platform: string
}

export interface Platforms {
  [key: string]: string
}

export interface PlatformFeatures {
  [key: string]: string[]
}

export interface TreePayLoad {
  urlPath: string,
  platform: string,
  crossLaunched: boolean,
  model: string,
  modelTitle: string, 
  release: string,
  allModels: Model[],
  paths: string[],
}

export interface ComparePayLoad {
  urlPath: string,
  x: string,
  y: string,
  model: string,
  xpaths: PathDef[],
  ypaths: PathDef[],
  yfeatures: Platforms
}

export interface PathDef {
  path: string,
  "is-state"?: string,
  "path-with-prefix": string,
  type: string,
  "enum-values"?: string[],
  description: string,
  default?: string,
  namespace?: string,
  "if-features"?: string[]
  release?: string
}