import { writable } from "svelte/store"

export const defaultPlatform = "7220-IXR-D2L"
export const count = 40

export const stateValues = [
  { label: "All", value: "" },
  { label: "State", value: "R" },
  { label: "Config", value: "RW" }
]

export const compareValues = [
  { label: "All", value: "" },
  { label: "Added", value: "+" },
  { label: "Deleted", value: "-" },
  { label: "Modified", value: "~" }
]

export let pathFocus = writable({})
