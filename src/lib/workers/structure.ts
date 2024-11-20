import type { PathDef, PlatformFeatures } from "$lib/structure"

export interface ComparePostMessage {
  x: string
  y: string
  model: string
}

export interface PlatformComparePostMessage {
  release: string
  x: string
  y: string
  xFeatures: string[]
  yFeatures: string[]
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
}

export interface YangTreePostMessage {
  model: string
  release: string
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

export interface YangTreeContainer {
  path: string
}

export interface YangTreeResponseMessage {
  name: string
  type: string
  children: YangTreeResponseMessage[]
  details: YangTreeContainer | PathDef
}