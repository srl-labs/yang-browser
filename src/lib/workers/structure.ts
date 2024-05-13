import type { PathDef } from "$lib/structure"

export interface PostMessage {
  x: PathDef[]
  y: PathDef[]
}

export interface ResponseMessage extends PathDef {
  fromType?: string
  fromRel?: string
  compare: string
}