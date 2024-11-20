import { derived, writable } from 'svelte/store'

import { count } from '$lib/components/sharedStore'

import type { PathDef, PlatformFeatures } from '$lib/structure'
import type { DiffResponseMessage } from '$lib/workers/structure'
import { featureBasedFilter, searchBasedFilter } from '$lib/components/functions'

// WRITABLE STORES
export const searchStore = writable("")
export const stateStore = writable("")
export const compareStore = writable("")

export const platFeat = writable<PlatformFeatures>({})
export const platFind = writable("")
export const platSelect = writable("")
export const platStore = writable<string[]>([])

export const yangPaths = writable<DiffResponseMessage[]>([])
export const start = writable(0)

// DERIVED STORES
export const featSelect = derived([platFeat, platSelect], ([$platFeat, $platSelect]) => 
  $platSelect != "" && Object.keys($platFeat)?.length ? $platFeat[$platSelect]: [])

export const compareFilter = derived([compareStore, yangPaths], ([$compareStore, $yangPaths]) => 
  $yangPaths.filter(x => $compareStore === "" ? true : x.compare === $compareStore))

export const stateFilter = derived([stateStore, compareFilter], ([$stateStore, $compareFilter]) => 
  $compareFilter.filter((x: PathDef) => $stateStore == "" ? true : x["is-state"] == $stateStore))

export const searchFilter = derived([searchStore, stateFilter], ([$searchStore, $stateFilter]) => 
  $stateFilter.filter(x => searchBasedFilter(x, $searchStore)))

export const platformFilter = derived([featSelect, searchFilter],  ([$featSelect, $searchFilter]) => 
  $featSelect?.length ? $searchFilter.filter(x => featureBasedFilter(x, $featSelect)) : $searchFilter)

export const total = derived(platformFilter, ($platformFilter) => {
  start.set(0)
  return $platformFilter.length
})

export const end = derived([start, total], ([$start, $total]) => 
  ($start + count) <= $total ? ($start + count) : $total)

export const paginated = derived([start, end, platformFilter], ([$start, $end, $platformFilter]) => 
  $platformFilter.slice($start, $end))
