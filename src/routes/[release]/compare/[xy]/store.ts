import { derived, writable } from 'svelte/store'

import { count } from '$lib/components/sharedStore'

import type { DiffResponseMessage } from '$lib/workers/structure'
import { searchBasedFilter } from '$lib/components/functions'

// WRITABLE STORES
export let searchStore = writable("")
export let stateStore = writable("")
export let compareStore = writable("")

export let yangPaths = writable<DiffResponseMessage[]>([])
export let start = writable(0)

// DERIVED STORES
export let compareFilter = derived([compareStore, yangPaths], ([$compareStore, $yangPaths]) => 
  $yangPaths.filter(x => $compareStore === "" ? true : x.compare === $compareStore))

export let stateFilter = derived([stateStore, compareFilter], ([$stateStore, $compareFilter]) => 
  $compareFilter.filter((x: any) => $stateStore == "" ? true : x["is-state"] == $stateStore))

export let searchFilter = derived([searchStore, stateFilter], ([$searchStore, $stateFilter]) => 
  $stateFilter.filter(x => searchBasedFilter(x, $searchStore)))

export let total = derived(searchFilter, ($platformFilter) => {
  start.set(0)
  return $platformFilter.length
})

export let end = derived([start, total], ([$start, $total]) => 
  ($start + count) <= $total ? ($start + count) : $total)

export let paginated = derived([start, end, searchFilter], ([$start, $end, $platformFilter]) => 
  $platformFilter.slice($start, $end))
