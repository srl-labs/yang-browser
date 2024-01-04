<script lang="ts">
  import { writable, derived } from 'svelte/store';
  
  import type { PayLoad } from '$lib/structure';

  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';

  /** @type {import('./$types').PageData} */
	export let data;
  let release = data.release;
  let paths = data.paths;

  // DEFAULTS
  let count = 20;
  let pathPrefix = false;

  let search = "";
  let term = writable("");
  $: term.set(search.trim());

  let scope = "";
  let state = writable("");
  $: state.set(scope);

  // INTERNAL FUNCTIONS
  const scopeChange = (val: string) => scope = val;
  const spaceSplit = (str: string) => str.split(/\s+/);

  const getState = (x) => ('is-state' in x ? "true" : "false");
  const getPath = (x) => (pathPrefix ? x["path-with-prefix"] : x["path"])
  const getEnumValues = (x) => ('enum-values' in x ? x["enum-values"].join(",") : '')

  const pathClearToTree = (str: string) => str.replaceAll("=*", "").replace("<mark>", "").replace("</mark>", "");

  const searchTerm = (x, term: string) => {
    let keys = spaceSplit(term);
    let pathChosen = pathPrefix ? x["path-with-prefix"] : x["path"];
    let searchStr = pathChosen + ";" + x["type"];
    let output = keys.every(x => searchStr.includes(x));
    return output;
  }

  const markTerm = (x, term: string) => {
    let keys = spaceSplit(term);
    const pattern = new RegExp(keys.join('|'), 'g');
    let tmp = "";
    if(pathPrefix) {
      tmp = x["path-with-prefix"].replace(pattern, match => `<mark>${match}</mark>`);
      x["path-with-prefix"] = tmp;
    } else {
      tmp = x["path"].replace(pattern, match => `<mark>${match}</mark>`);
      x["path"] = tmp;
    }
    tmp = x["type"].replace(pattern, match => `<mark>${match}</mark>`);
    x["type"] = tmp;
    return x;
  }

  // WRITABLE STORES
  let start = writable(0);
  let yangPaths = writable(paths);

  // DERIVED STORES
  let stateFilter = derived([state, yangPaths], ([$state, $yangPaths]) => $yangPaths.filter((x: any) => $state == "" ? true : getState(x) == $state));

  let yangFilter = derived([term, stateFilter],  ([$term, $stateFilter]) => $stateFilter.filter((x: any) => searchTerm(x, $term)));

  let highlight = derived([term, yangFilter],  ([$term, $yangFilter]) => $yangFilter.map((x: any) => $term != "" ? markTerm(x, $term) : x));

  let total = derived(highlight, ($highlight) => {start.set(0); return $highlight.length});

  let end = derived([start, total], ([$start, $total]) => ($start + count) <= $total ? ($start + count) : $total);

  let paginated = derived([start, end, highlight], ([$start, $end, $highlight]) => $highlight.slice($start, $end));

  // UPDATE TABLE PAGINATION
  const updateTable = (s: number) => {if(s >= 0 && s < $total) start.set(s)}

</script>

<svelte:head>
	<title>NSP Path Browser {release}</title>
</svelte:head>

<div class="min-w-[280px] overflow-x-auto font-nokia-headline-light">
  <Header release={release} home={true} />
  <div class="p-6 dark:bg-gray-800">
    <div class="mb-2">
      <input type="text" id="search" bind:value={search} placeholder="Search..." class="w-full px-3 py-2 text-sm rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:placeholder-gray-400">
    </div>  
    <div class="flex justify-between flex-wrap">
      <div class="flex py-3">
        <div class="flex dark:text-gray-400">
          <div class="flex items-center mr-4">
            <input id="all-radio" type="radio" name="is-state-group" class="w-4 h-4" checked={scope === ""} on:change={() => scopeChange("")}>
            <label for="all-radio" class="ml-2 text-sm text-gray-900 dark:text-gray-400 cursor-pointer">All</label>
          </div>
          <div class="flex items-center mr-4">
            <input id="state-radio" type="radio" name="is-state-group" class="w-4 h-4" checked={scope === "true"} on:change={() => scopeChange("true")}>
            <label for="state-radio" class="ml-2 text-sm text-gray-900 dark:text-gray-400 cursor-pointer">State</label>
          </div>
          <div class="flex items-center mr-4">
            <input id="config-radio" type="radio" name="is-state-group" class="w-4 h-4" checked={scope === "false"} on:change={() => scopeChange("false")}>
            <label for="config-radio" class="ml-2 text-sm text-gray-900 dark:text-gray-400 cursor-pointer">Config</label>
          </div>
        </div>
      </div>
      <div class="flex items-center py-3 ml-auto">
        {#if $total > 0}
          <p class="mr-2 text-sm dark:text-gray-400">{$start + 1} - {$end > 1 ? $end : 0} of {$total}</p>
          <button class="ml-2 {$start == 0 ? 'bg-gray-300 dark:bg-gray-500 opacity-50 cursor-not-allowed' : 'bg-gray-400 hover:bg-gray-600'} text-white text-sm rounded" disabled="{$start == 0}" on:click={() => updateTable($start - count)}>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd"/>
            </svg>
          </button>
          <button class="ml-2 {$end == $total ? 'bg-gray-300 dark:bg-gray-500 opacity-50 cursor-not-allowed' : 'bg-gray-400 hover:bg-gray-600'} text-white text-sm rounded" disabled="{$end == $total}" on:click={() => updateTable($end)}>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/>
            </svg>
          </button>
        {/if}
      </div>
    </div>
    <div class="flex items-center px-3 py-1 w-fit border hover:border-gray-300 dark:border-gray-500 dark:hover:border-gray-400 rounded-full cursor-pointer">
      <input id="prefix-checkbox" type="checkbox" value="" class="w-3 h-3 cursor-pointer" checked={pathPrefix} on:change={() => pathPrefix = !pathPrefix}>
      <label for="prefix-checkbox" class="ms-2 text-xs font-medium text-gray-900 dark:text-gray-300 select-none cursor-pointer">Show prefix</label>
    </div>
    <div class="overflow-x-auto max-w-full mt-5">
      <table class="text-left w-full">
        <colgroup>
          <col span="1" class="w-[5%]">
          <col span="1" class="w-[80%]">
          <col span="1" class="w-[13%]">
          <col span="1" class="w-[2%]">
        </colgroup>
        <thead class="text-xs uppercase text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" class="p-3">State</th>
            <th scope="col" class="p-3">Path</th>
            <th scope="col" class="p-3">Type</th>
            <th scope="col" class="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {#if $total > 0}
            {#each $paginated as item}
              <tr class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 text-gray-700 dark:text-gray-300">
                <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight">{getState(item)}</td>
                <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight"><div title="{item["description"]}">{@html getPath(item)}</div></td>
                <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight"><div title="{getEnumValues(item)}">{@html item["type"]}</div></td>
                <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight">
                  <div title="Show path in tree">
                    <a data-sveltekit-preload-data="tap" href="/{release}/tree?path={pathClearToTree(item["path"])}">
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
    <Footer home={false}/>
  </div>  
</div>