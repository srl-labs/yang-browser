import { derived, writable } from "svelte/store"
import type { PlatformFeatures } from "$lib/structure"
import type { YangTreeResponseMessage } from "$lib/workers/structure"

// WRITABLE STORES
export let searchStore = writable("")
export let stateStore = writable("")
export let platFeat = writable<PlatformFeatures>({})
export let platSelect = writable("")
export let yangTarget = writable<YangTreeResponseMessage>({})

// DERIVED STORES
export let yangTreeArgs = derived([searchStore, stateStore, platSelect], ([$searchStore, $stateStore, $platSelect]) => 
  $searchStore + ";;" + $stateStore + ";;" + $platSelect)

export let featSelect = derived([platFeat, platSelect], ([$platFeat, $platSelect]) => 
  $platFeat[$platSelect] || [])
