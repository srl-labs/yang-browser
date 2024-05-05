<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { closeSidebar, highlight } from '$lib/components/functions.js';
	import { writable, derived } from 'svelte/store';

  interface ComparePaths {
    state: string, path: string,
    type: string, compare: string,
    version: string
  }

  export let data
  const {x, y, model, diff} = data
  
  const frameObj = (pathEntry: string, kind: string, version: string) => {
    const [state, path, type] = pathEntry.split(";")
    return {
      state: state, path: path,
      type: type, compare: kind,
      version: version
    }
  }

  const sortByKey = (list: ComparePaths[]) => {
    return list.sort((a, b) => {
      const keyA = a["path"];
      const keyB = b["path"];
      
      if (keyA < keyB) {
          return -1;
      }
      if (keyA > keyB) {
          return 1;
      }
      return 0;
    });
  }

  let count = 40;
  let paths: ComparePaths[] = []
  paths = [...paths, ...diff["commonXY"].map(x => frameObj(x, "=", y))]
  paths = [...paths, ...diff["newInY"].map(x => frameObj(x, "+", y))]
  paths = [...paths, ...diff["removedFromX"].map(x => frameObj(x, "-", x))]
  paths = sortByKey(paths)

  let searchInput = ""
  let searchStore = writable("")
  $: searchStore.set(searchInput.trim().toLowerCase())

  let compareInput = ""
  let compareStore = writable("")
  $: compareStore.set(compareInput)

  let stateInput = ""
  let stateStore = writable("")
  $: stateStore.set(stateInput)

  // INTERNAL FUNCTIONS
  const compareChange = (val: string) => compareInput = val
  const scopeChange = (val: string) => stateInput = val
  const getSearchKeys = (str: string) => str.split(/\s+/).join("|")
  const searchBasedFilter = (x: ComparePaths, searchTerm: string) => {
    const keys = searchTerm.split(/\s+/)
    const searchStr = `${x.path};${x.type}`
    return keys.every(x => searchStr.includes(x))
  }

  // WRITABLE STORES
  let start = writable(0);
  let allPaths = writable(paths);

  // DERIVED STORES
  let compareFilter = derived([compareStore, allPaths], ([$compareStore, $allPaths]) => $allPaths.filter(x => $compareStore === "" ? true : x.compare === $compareStore));
  let stateFilter = derived([stateStore, compareFilter], ([$stateStore, $compareFilter]) => $compareFilter.filter(x => $stateStore === "" ? true : x.state === $stateStore));
  let searchFilter = derived([searchStore, stateFilter], ([$searchStore, $stateFilter]) => $stateFilter.filter(x => searchBasedFilter(x, $searchStore)));

  let total = derived(searchFilter, ($searchFilter) => {start.set(0); return $searchFilter.length});
  let end = derived([start, total], ([$start, $total]) => ($start + count) <= $total ? ($start + count) : $total);
  let paginated = derived([start, end, searchFilter], ([$start, $end, $searchFilter]) => $searchFilter.slice($start, $end));

  // UPDATE TABLE PAGINATION
  const updateTable = (s: number) => {if(s >= 0 && s < $total) start.set(s)}
</script>

<svelte:head>
	<title>Nokia SR Linux Compare {x} with {y} Yang Model</title>
</svelte:head>


<Header model={model} modelTitle={"compare"} release={`${x};${y}`} home={true} />
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="min-w-[280px] overflow-x-auto font-nokia-headline-light dark:bg-gray-800 pt-[75px] lg:pt-[80px]" on:click={closeSidebar}>
  <div class="px-6 pt-6 container mx-auto">
    <div class="pt-4 pb-2 text-center">
      <div class="flex items-center text-center text-gray-800 dark:text-gray-300 text-sm">
        <div class="flex items-center mr-4">
          <input id="all-compare-radio" type="radio" name="is-compare-group" class="w-4 h-4" checked={compareInput === ""} on:change={() => compareChange("")}>
          <label for="all-compare-radio" class="ml-2 cursor-pointer">All</label>
        </div>
        <div class="flex items-center mr-4">
          <input id="common-compare-radio" type="radio" name="is-compare-group" class="w-4 h-4" checked={compareInput === "="} on:change={() => compareChange("=")}>
          <label for="common-compare-radio" class="ml-2 cursor-pointer">Common</label>
        </div>
        <div class="flex items-center mr-4">
          <input id="newInY-compare-radio" type="radio" name="is-compare-group" class="w-4 h-4" checked={compareInput === "+"} on:change={() => compareChange("+")}>
          <label for="newInY-compare-radio" class="ml-2 cursor-pointer">New in {y}</label>
        </div>
        <div class="flex items-center mr-4">
          <input id="removedFromX-compare-radio" type="radio" name="is-compare-group" class="w-4 h-4" checked={compareInput === "-"} on:change={() => compareChange("-")}>
          <label for="removedFromX-compare-radio" class="ml-2 cursor-pointer">Removed from {x}</label>
        </div>
      </div>
    </div>
    <div class="py-2 font-fira">
      <input type="text" bind:value={searchInput} placeholder="Search..." class="w-full text-[13px] px-3 py-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:placeholder-gray-400">
    </div>
    <div class="flex justify-between flex-wrap">
      <div class="flex py-3">
        <div class="flex items-center text-gray-800 dark:text-gray-300 text-sm">
          <div class="flex items-center mr-4">
            <input id="all-radio" type="radio" name="is-state-group" class="w-4 h-4" checked={stateInput === ""} on:change={() => scopeChange("")}>
            <label for="all-radio" class="ml-2 cursor-pointer">All</label>
          </div>
          <div class="flex items-center mr-4">
            <input id="state-radio" type="radio" name="is-state-group" class="w-4 h-4" checked={stateInput === "true"} on:change={() => scopeChange("true")}>
            <label for="state-radio" class="ml-2 cursor-pointer">State</label>
          </div>
          <div class="flex items-center mr-4">
            <input id="config-radio" type="radio" name="is-state-group" class="w-4 h-4" checked={stateInput === "false"} on:change={() => scopeChange("false")}>
            <label for="config-radio" class="ml-2 cursor-pointer">Config</label>
          </div>
        </div>
      </div>
      <div class="flex items-center py-3 ml-auto text-sm">
        {#if $total > 0}
          <p class="mr-2 text-gray-800 dark:text-gray-200">{$start + 1} - {$end > 1 ? $end : 0} of {$total}</p>
          <button class="ml-2 {$start == 0 ? 'bg-gray-300 dark:bg-gray-500 opacity-50 cursor-not-allowed' : 'bg-gray-400 hover:bg-gray-600'} text-white rounded" disabled="{$start == 0}" on:click={() => updateTable($start - count)}>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd"/>
            </svg>
          </button>
          <button class="ml-2 {$end == $total ? 'bg-gray-300 dark:bg-gray-500 opacity-50 cursor-not-allowed' : 'bg-gray-400 hover:bg-gray-600'} text-white rounded" disabled="{$end == $total}" on:click={() => updateTable($end)}>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/>
            </svg>
          </button>
        {/if}
      </div>
    </div>
    <div class="overflow-x-auto rounded-t-lg max-w-full mt-5">
      <table class="text-left w-full">
        <colgroup>
          <col span="1" class="w-[5%]">
          <col span="1" class="w-[80%]">
          <col span="1" class="w-[13%]">
          <col span="1" class="w-[2%]">
        </colgroup>
        <thead class="text-sm font-nokia-headline text-gray-800 dark:text-gray-300 bg-gray-300 dark:bg-gray-700">
          <tr>
            <th scope="col" class="px-3 py-2">State</th>
            <th scope="col" class="px-3 py-2">Path</th>
            <th scope="col" class="px-3 py-2">Type</th>
            <th scope="col" class="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {#if $total > 0}
            {#each $paginated as item}
              <tr class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 
                text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:cursor-pointer 
                {item.compare === "-" ? 'bg-red-500 text-white hover:bg-red-400 dark:bg-red-800 hover:dark:bg-red-700' : 
                (item.compare === "+" ? 'bg-green-400 hover:bg-green-500 hover:text-white dark:bg-green-800 hover:dark:bg-green-700' : '') }">
                <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight">{item.state}</td>
                <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight">
                  <div use:highlight={[getSearchKeys($searchStore), item.path]}></div>
                </td>
                <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight">
                  <div use:highlight={[getSearchKeys($searchStore), item.type]}></div>
                </td>
                <td class="px-3 py-1.5 text-[13px]">
                  <div title="Show path details">
                    <a data-sveltekit-preload-data="tap" target="_blank" href="/v{item.version}?path={encodeURIComponent(item.path)}{model !== "nokia" ? `&model=${model}` : ''}">
                      <svg class="w-3 h-3 hover:text-gray-500 dark:hover:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                      </svg>
                    </a>
                  </div>
                </td>
              </tr>
            {/each}
          {:else}
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td colspan="3" class="px-3 py-1.5 font-fira text-[13px] text-red-600 text-center">No results found</td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
    <div class="flex items-center justify-end py-3 text-sm mt-2">
      {#if $total > 0}
        <p class="mr-2 text-gray-800 dark:text-gray-200">{$start + 1} - {$end > 1 ? $end : 0} of {$total}</p>
        <button class="ml-2 {$start == 0 ? 'bg-gray-300 dark:bg-gray-500 opacity-50 cursor-not-allowed' : 'bg-gray-400 hover:bg-gray-600'} text-white rounded" disabled="{$start == 0}" on:click={() => updateTable($start - count)}>
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd"/>
          </svg>
        </button>
        <button class="ml-2 {$end == $total ? 'bg-gray-300 dark:bg-gray-500 opacity-50 cursor-not-allowed' : 'bg-gray-400 hover:bg-gray-600'} text-white rounded" disabled="{$end == $total}" on:click={() => updateTable($end)}>
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/>
          </svg>
        </button>
      {/if}
    </div>
  </div>
  <Footer home={false}/>
</div>
