export interface Releases {
  [key: string]: Release;
}

export interface Release {
  openconfig: boolean
}

export interface HomeGroup {
  [key: string]: {
    top3: string[],
    others: string[],
    all: {
      [key: string]: string[]
    }
  }
}

export interface Other {
  name: string, 
  path: string
}

export interface PayLoad {
  release: string,
  paths: string[]
}

export interface TreePayLoad {
  path: string,
  release: string,
  paths: string[]
}

export interface PathDef {
  path: string,
  "path-with-prefix": string,
  type: string,
  "enum-values"?: string[],
  description: string,
  default?: string,
  namespace?: string,
  "if-features"?: string[]
}