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
  platforms: PlatformFeatures
  uniqueFeatures: string[]
}

export interface FetchPostMessage {
  model: string
  release: string
  urlOrigin: string
}

export interface FetchResponseMessage {
  paths: PathDef[]
  platforms: PlatformFeatures
  uniqueFeatures: string[]
}

export interface TreeResponseMessage {
  name?: string
  children?: any[]
  details?: any | PathDef
}