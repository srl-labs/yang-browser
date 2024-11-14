import { writable, derived } from "svelte/store"

import { count } from "$lib/components/sharedStore"
import type { PathDef, PlatformFeatures } from "$lib/structure"
import { searchBasedFilter, featureBasedFilter } from "$lib/components/functions"

// WRITABLE STORES
export let searchStore = writable("")
export let stateStore = writable("")
export let prefixStore = writable(false)

export let platFeat = writable<PlatformFeatures>({})
export let platStore = writable<string[]>([])
export let platFind = writable("")
export let platSelect = writable("")

export let featStore = writable<string[]>([])
export let featFind = writable("")
export let featDeviate = writable<string[]>([])
export let featExtra = writable<string[]>([])
export let featClear = writable(false)

export let yangPaths = writable<PathDef[]>([])
export let start = writable(0)

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
export let platList = derived([platFind, platStore], ([$platFind, $platStore]) => 
  $platStore.filter((x: string) => x.includes($platFind)))

export let featList = derived([featFind, featStore], ([$featFind, $featStore]) => 
  $featStore.filter((x: string) => x.includes($featFind)))

export let featSelect = derived([platFeat, platSelect, featClear], ([$platFeat, $platSelect, $featClear]) => 
  $featClear ? [] : ($platFeat[$platSelect] || []))

export let featFilter = derived([featSelect, featDeviate, featExtra], ([$featSelect, $featDeviate, $featExtra]) => 
  featFilterAction($featSelect, $featDeviate, $featExtra))

export let stateFilter = derived([stateStore, yangPaths], ([$stateStore, $yangPaths]) => 
  $yangPaths.filter((x: any) => $stateStore == "" ? true : x["is-state"] == $stateStore))

export let searchFilter = derived([searchStore, stateFilter, prefixStore], ([$searchStore, $stateFilter, $prefixStore]) => 
  $stateFilter.filter((x: any) => searchBasedFilter(x, $searchStore, $prefixStore)))

export let platFeatFilter = derived([featFilter, searchFilter],  ([$featFilter, $searchFilter]) => 
  $featFilter?.length ? $searchFilter.filter((x: any) => featureBasedFilter(x, $featFilter)) : $searchFilter)

export let total = derived(platFeatFilter, ($platFeatFilter) => { 
  start.set(0)
  return $platFeatFilter.length
})

export let end = derived([start, total], ([$start, $total]) => 
  ($start + count) <= $total ? ($start + count) : $total)

export let paginated = derived([start, end, platFeatFilter], ([$start, $end, $platFeatFilter]) => 
  $platFeatFilter.slice($start, $end))
