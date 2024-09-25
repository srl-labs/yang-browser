import { writable } from 'svelte/store';

export let pathFocus = writable({});

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