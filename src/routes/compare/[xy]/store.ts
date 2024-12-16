import { derived, writable } from 'svelte/store'

import { count } from '$lib/components/sharedStore'

import type { PlatformFeatures } from '$lib/structure'
import type { DiffResponseMessage } from '$lib/workers/structure'
import { featureBasedFilter, searchBasedFilter } from '$lib/components/functions'

// WRITABLE STORES
export let searchStore = writable("")
export let stateStore = writable("")
export let compareStore = writable("")

export let platFeat = writable<PlatformFeatures>({})
export let platFind = writable("")
export let platSelect = writable("")
export let platStore = writable<string[]>([])

export let yangPaths = writable<DiffResponseMessage[]>([])
export let start = writable(0)

// DERIVED STORES
export let featSelect = derived([platFeat, platSelect], ([$platFeat, $platSelect]) => 
  $platSelect != "" && Object.keys($platFeat)?.length ? $platFeat[$platSelect]: [])

export let compareFilter = derived([compareStore, yangPaths], ([$compareStore, $yangPaths]) => 
  $yangPaths.filter(x => $compareStore === "" ? true : x.compare === $compareStore))

export let stateFilter = derived([stateStore, compareFilter], ([$stateStore, $compareFilter]) => 
  $compareFilter.filter((x: any) => $stateStore == "" ? true : x["is-state"] == $stateStore))

export let searchFilter = derived([searchStore, stateFilter], ([$searchStore, $stateFilter]) => 
  $stateFilter.filter(x => searchBasedFilter(x, $searchStore)))

export let platformFilter = derived([featSelect, searchFilter],  ([$featSelect, $searchFilter]) => 
  $featSelect?.length ? $searchFilter.filter(x => featureBasedFilter(x, $featSelect)) : $searchFilter)

export let total = derived(platformFilter, ($platformFilter) => {
  start.set(0)
  return $platformFilter.length
})

export let end = derived([start, total], ([$start, $total]) => 
  ($start + count) <= $total ? ($start + count) : $total)

export let paginated = derived([start, end, platformFilter], ([$start, $end, $platformFilter]) => 
  $platformFilter.slice($start, $end))
