import type { PathDef, Platforms, PlatformFeatures } from "$lib/structure"

export interface ComparePostMessage {
  x: string
  y: string
  model: string
  urlOrigin: string
}

export interface DiffResponseMessage extends PathDef {
  fromType?: string
  fromRel?: string
  compare: string
}

export interface CompareResponseMessage {
  diff: DiffResponseMessage[]
  platformFeatures: PlatformFeatures
  uniqueFeatures: string[]
}

export interface FetchPostMessage {
  model: string
  release: string
  urlOrigin: string
}

export interface YangTreePostMessage {
  model: string
  release: string
  urlOrigin: string
  searchInput: string
  stateInput: string 
  featSelect: string[]
}

export interface FetchResponseMessage {
  paths: PathDef[]
  platformFeatures: PlatformFeatures
  uniqueFeatures: string[]
}

export interface TreeResponseMessage {
  platforms: PlatformFeatures
  uniqueFeatures: string[]
}

export interface YangTreeResponseMessage {
  name?: string
  children?: any[]
  details?: any | PathDef
}