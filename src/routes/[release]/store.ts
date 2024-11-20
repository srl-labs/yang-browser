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
function featFilterAction (platFeatures: string[], deviation: string[], extras: string[]) {
  if(platFeatures?.length) {
    platFeatures = platFeatures.filter(f => !deviation.includes(f))
    return platFeatures.concat(extras)
  } else {
    return deviation.concat(extras)
  }
}

// DERIVED STORES
export const platList = derived([platFind, platStore], ([$platFind, $platStore]) => 
  $platStore.filter((x: string) => x.includes($platFind)))

export const featList = derived([featFind, featStore], ([$featFind, $featStore]) => 
  $featStore.filter((x: string) => x.includes($featFind)))

export const featSelect = derived([platFeat, platSelect, featClear], ([$platFeat, $platSelect, $featClear]) => 
  $featClear ? [] : ($platFeat[$platSelect] || []))

export const featFilter = derived([featSelect, featDeviate, featExtra], ([$featSelect, $featDeviate, $featExtra]) => 
  featFilterAction($featSelect, $featDeviate, $featExtra))

export const stateFilter = derived([stateStore, yangPaths], ([$stateStore, $yangPaths]) => 
  $yangPaths.filter((x: PathDef) => $stateStore == "" ? true : x["is-state"] == $stateStore))

export const searchFilter = derived([searchStore, stateFilter, prefixStore], ([$searchStore, $stateFilter, $prefixStore]) => 
  $stateFilter.filter((x: PathDef) => searchBasedFilter(x, $searchStore, $prefixStore)))

export const commonFilter = derived([searchFilter, commonStore], ([$searchFilter, $commonStore]) => 
  $commonStore ? $searchFilter : $searchFilter.filter((x: PathDef) => ("if-features" in x)))

export const platFeatFilter = derived([featFilter, commonFilter],  ([$featFilter, $commonFilter]) => 
  $featFilter?.length ? $commonFilter.filter((x: PathDef) => featureBasedFilter(x, $featFilter)) : $commonFilter)

export const total = derived(platFeatFilter, ($platFeatFilter) => { 
  start.set(0)
  return $platFeatFilter.length
})

export const end = derived([start, total], ([$start, $total]) => 
  ($start + count) <= $total ? ($start + count) : $total)

export const paginated = derived([start, end, platFeatFilter], ([$start, $end, $platFeatFilter]) => 
  $platFeatFilter.slice($start, $end))
