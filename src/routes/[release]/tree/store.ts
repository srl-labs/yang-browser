import { derived, writable } from "svelte/store"
import type { PlatformFeatures } from "$lib/structure"
import type { YangTreeResponseMessage } from "$lib/workers/structure"

// WRITABLE STORES
export const searchStore = writable("")
export const stateStore = writable("")
export const platFeat = writable<PlatformFeatures>({})
export const platSelect = writable("")
export const yangTarget = writable<YangTreeResponseMessage>({})

// DERIVED STORES
export const yangTreeArgs = derived([searchStore, stateStore, platSelect], ([$searchStore, $stateStore, $platSelect]) => 
  $searchStore + ";;" + $stateStore + ";;" + $platSelect)

export const featSelect = derived([platFeat, platSelect], ([$platFeat, $platSelect]) => 
  $platFeat[$platSelect] || [])
