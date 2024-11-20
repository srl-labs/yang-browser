import { derived, writable } from 'svelte/store'

import { count } from '$lib/components/sharedStore'

import type { DiffResponseMessage } from '$lib/workers/structure'
import { searchBasedFilter } from '$lib/components/functions'
import type { PathDef } from '$lib/structure'

// WRITABLE STORES
export const searchStore = writable("")
export const stateStore = writable("")
export const compareStore = writable("")

export const yangPaths = writable<DiffResponseMessage[]>([])
export const start = writable(0)

// DERIVED STORES
export const compareFilter = derived([compareStore, yangPaths], ([$compareStore, $yangPaths]) => 
  $yangPaths.filter(x => $compareStore === "" ? true : x.compare === $compareStore))

export const stateFilter = derived([stateStore, compareFilter], ([$stateStore, $compareFilter]) => 
  $compareFilter.filter((x: PathDef) => $stateStore == "" ? true : x["is-state"] == $stateStore))

export const searchFilter = derived([searchStore, stateFilter], ([$searchStore, $stateFilter]) => 
  $stateFilter.filter(x => searchBasedFilter(x, $searchStore)))

export const total = derived(searchFilter, ($platformFilter) => {
  start.set(0)
  return $platformFilter.length
})

export const end = derived([start, total], ([$start, $total]) => 
  ($start + count) <= $total ? ($start + count) : $total)

export const paginated = derived([start, end, searchFilter], ([$start, $end, $platformFilter]) => 
  $platformFilter.slice($start, $end))
