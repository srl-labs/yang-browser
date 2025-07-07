interface SamplePayload {
  [key: string]: unknown
}

interface NspInventoryFind {
  "xpath-filter": string
  "include-meta": boolean
  fields: string
  depth: number
  limit: number
  offset: number
}

export interface InventoryFindPostMessage {
  kind: string
  nsp: NspInventoryFind
}

export interface InventoryFindResponseMessage {
  type: string
  value: number
  success: boolean
  message: string
  output: SamplePayload
}