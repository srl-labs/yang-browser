import { writable, derived } from "svelte/store"

import { count } from "$lib/components/sharedStore"
import type { PathDef, PlatformFeatures } from "$lib/structure"
import { searchBasedFilter, featureBasedFilter } from "$lib/components/functions"

// WRITABLE STORES
export const searchStore = writable("")
export const stateStore = writable("")
export const prefixStore = writable(false)
export const commonStore = writable(true)

export const platFeat = writable<PlatformFeatures>({})
export const platStore = writable<string[]>([])
export const platFind = writable("")
export const platSelect = writable("")

export const featStore = writable<string[]>([])
export const featFind = writable("")
export const featDeviate = writable<string[]>([])
export const featExtra = writable<string[]>([])
export const featClear = writable(false)

export const yangPaths = writable<PathDef[]>([])
export const start = writable(0)

// FEATURE BASED FILTER
function featFilterAction (validFeatures: string[], selectedFeatures: string[], deviation: string[], extras: string[]) {
  if(selectedFeatures?.length) {
    selectedFeatures = selectedFeatures.filter(f => !deviation.includes(f))
    return selectedFeatures.concat(extras)
  } else {
    if(validFeatures?.length) {
      return validFeatures.filter(f => extras.includes(f))
    }
  }
  return []
}

// DERIVED STORES
export const platList = derived([platFind, platStore], ([$platFind, $platStore]) => 
  $platStore.filter((x: string) => x.includes($platFind)))

export const featList = derived([featFind, featStore], ([$featFind, $featStore]) => 
  $featStore.filter((x: string) => x.includes($featFind)))

export const validFeatures = derived([platFeat, platSelect], ([$platFeat, $platSelect]) => $platFeat[$platSelect])

export const platformPaths = derived([yangPaths, validFeatures, commonStore],  ([$yangPaths, $validFeatures, $commonStore]) => 
  $yangPaths?.length && $validFeatures?.length ? $yangPaths.filter((x: PathDef) => featureBasedFilter(x, $validFeatures, $commonStore)) : [])

export const featSelect = derived([validFeatures, featClear], ([$validFeatures, $featClear]) => 
  $featClear ? [] : $validFeatures)

export const featFilter = derived([validFeatures, featSelect, featDeviate, featExtra], ([$validFeatures, $featSelect, $featDeviate, $featExtra]) => 
  featFilterAction($validFeatures, $featSelect, $featDeviate, $featExtra))

export const platFeatFilter = derived([platformPaths, featFilter, commonStore],  ([$platformPaths, $featFilter, $commonStore]) => 
  $platformPaths.filter((x: PathDef) => featureBasedFilter(x, $featFilter, $commonStore)))

export const stateFilter = derived([stateStore, platFeatFilter], ([$stateStore, $platFeatFilter]) => 
  $platFeatFilter.filter((x: PathDef) => $stateStore == "" ? true : x["is-state"] == $stateStore))

export const searchFilter = derived([searchStore, stateFilter, prefixStore], ([$searchStore, $stateFilter, $prefixStore]) => 
  $stateFilter.filter((x: PathDef) => searchBasedFilter(x, $searchStore, $prefixStore)))

export const total = derived(searchFilter, ($searchFilter) => { 
  start.set(0)
  return $searchFilter.length
})

export const end = derived([start, total], ([$start, $total]) => 
  ($start + count) <= $total ? ($start + count) : $total)

export const paginated = derived([start, end, searchFilter], ([$start, $end, $searchFilter]) => 
  $searchFilter.slice($start, $end))
