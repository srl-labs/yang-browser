<script lang="ts">
  import { writable, derived } from 'svelte/store';
  
  import type { PayLoad, PathDef } from '$lib/structure';

  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';

	export let data: PayLoad;
  let release = data.release;
  let paths = data.paths;
  let platforms: any = {};
  let features: string[] = [];
  if("features" in data) {
    let allFeatures: string[] = [];
    for (const [key, value] of Object.entries(data.features)) {
      let platformFeatures = value.split(/\s+/);
      platforms[key] = platformFeatures;
      allFeatures = allFeatures.concat(platformFeatures);
    }
    features = [...new Set(allFeatures)].sort();
  }

  // DEFAULTS
  let count = 40;
  let pathPrefix = false;
  let moreFilters = false;

  let search = "";
  let term = writable("");
  $: term.set(search.trim());

  let scope = "";
  let state = writable("");
  $: state.set(scope);

  let platformSearch = "";
  let platFind = writable("");
  $: platFind.set(platformSearch.trim());

  let featureSearch = "";
  let featFind = writable("");
  $: featFind.set(featureSearch.trim());

  // INTERNAL FUNCTIONS
  const scopeChange = (val: string) => scope = val;
  const spaceSplit = (str: string) => str.split(/\s+/);

  const getState = (x: PathDef) => ('is-state' in x ? "true" : "false");
  const getPath = (x: PathDef) => (pathPrefix ? x["path-with-prefix"] : x["path"])
  const getEnumValues = (x: PathDef) => ('enum-values' in x ? x["enum-values"].join(",") : '')
  const getSearchKeys = (str: string) => spaceSplit(str).join("|")

  const pathClearToTree = (str: string) => str.replaceAll("=*", "").replace("<mark>", "").replace("</mark>", "");

  const searchTerm = (x: PathDef, term: string) => {
    let keys = spaceSplit(term);
    let pathChosen = pathPrefix ? x["path-with-prefix"] : x["path"];
    let searchStr = pathChosen + ";" + x["type"];
    let output = keys.every(x => searchStr.includes(x));
    return output;
  }

  const highlight = (node: HTMLDivElement, [rawRex, text]: [string, string]) => {
    let marker = (txt: string, rex: RegExp) => txt.replace(rex, (term) => `<mark>${term}</mark>`);
    let action = () => node.innerHTML = marker(text, new RegExp(rawRex, "g"));
    action();
    return {
      update(obj: [string, string]) {
        [rawRex, text] = obj;
        action();
      },
    };
  }

  // WRITABLE STORES
  let start = writable(0);
  let yangPaths = writable(paths);
  let platStore = writable(Object.keys(platforms));
  let featStore = writable(features);

  let platSelect = writable("");
  let featSelect = derived(platSelect, ($platSelect) => $platSelect != "" ? platforms[$platSelect]: []);

  // DERIVED STORES
  let platList = derived([platFind, platStore],  ([$platFind, $platStore]) => $platStore.filter((x: string) => x.includes($platFind)));
  
  let featList = derived([featFind, featStore],  ([$featFind, $featStore]) => $featStore.filter((x: string) => x.includes($featFind)));
  
  let stateFilter = derived([state, yangPaths], ([$state, $yangPaths]) => $yangPaths.filter((x: any) => $state == "" ? true : getState(x) == $state));

  let yangFilter = derived([term, stateFilter],  ([$term, $stateFilter]) => $stateFilter.filter((x: any) => searchTerm(x, $term)));

  let total = derived(yangFilter, ($yangFilter) => {start.set(0); return $yangFilter.length});

  let end = derived([start, total], ([$start, $total]) => ($start + count) <= $total ? ($start + count) : $total);

  let paginated = derived([start, end, yangFilter], ([$start, $end, $yangFilter]) => $yangFilter.slice($start, $end));

  // UPDATE TABLE PAGINATION
  const updateTable = (s: number) => {if(s >= 0 && s < $total) start.set(s)}

</script>

<svelte:head>
	<title>Nokia SR Linux {release} Yang Model</title>
</svelte:head>

<div class="min-w-[280px] overflow-x-auto font-nunito dark:bg-gray-800">
  <Header release={release} home={true} />
  <div class="p-6 container mx-auto">
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
    <div class="flex items-center">
      <div class="flex items-center px-3 py-1 w-fit border hover:border-gray-300 dark:border-gray-500 dark:hover:border-gray-400 rounded-full cursor-pointer">
        <input id="prefix-checkbox" type="checkbox" class="w-3 h-3 cursor-pointer" checked={pathPrefix} on:change={() => pathPrefix = !pathPrefix}>
        <label for="prefix-checkbox" class="ms-2 text-xs text-gray-900 dark:text-gray-300 select-none cursor-pointer">Show prefix</label>
      </div>
      <button class="flex items-center ml-2 px-3 py-1 w-fit text-xs rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white" on:click={() => moreFilters = !moreFilters}>
        {#if !moreFilters}
          <svg class="w-2 h-2 mr-1 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16"/>
          </svg>
        {/if}
        {#if moreFilters}
          <svg class="w-2 h-2 mr-1 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h16"/>
          </svg>
        {/if}
        Filters
      </button>
    </div>
    <div class="{moreFilters ? 'block' : 'block'}">
      <div class="flex flex-wrap items-start mt-4 text-sm md:space-x-6">
        <div class="rounded-lg border border-gray-200 dark:border-gray-600 w-full md:w-40">
          <p class="px-4 py-2 font-bold text-gray-900 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">Platform</p>
          <div class="p-2 border-b border-gray-200 dark:border-gray-600">
            <input type="text" id="platformSearch" bind:value={platformSearch} placeholder="Search..." class="w-full px-3 py-1 text-xs rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:placeholder-gray-400">
          </div>
          <div class="overflow-y-auto max-h-72 scroll-light dark:scroll-dark">
            <ul class="">
              {#each $platList as entry, i}
                <li class="w-full {i == 0 ? '' : 'border-t border-gray-200 dark:border-gray-600'}">
                  <div class="flex items-center px-3">
                    <input id="radio-{entry}" type="radio" name="list-radio" class="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-600" on:click={platSelect.set(entry)}>
                    <label for="radio-{entry}" class="w-full py-2 ms-2 text-[13px] text-gray-900 dark:text-gray-300">{entry}</label>
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        </div>
        <div class="rounded-lg border border-gray-200 dark:border-gray-600 w-full md:w-fit mt-5 md:mt-0">
          <p class="px-4 py-2 font-bold text-gray-900 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">Features</p>
          <div class="p-2 border-b border-gray-200 dark:border-gray-600">
            <input type="text" id="featureSearch" bind:value={featureSearch} placeholder="Search..." class="w-full px-3 py-1 text-xs rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:placeholder-gray-400">
          </div>
          <div class="overflow-y-auto max-h-72 scroll-light dark:scroll-dark">
            <ul>
              {#each $featList as entry, i}
                <li class="w-full {i == 0 ? '' : 'border-t border-gray-200 dark:border-gray-600'}">
                  <div class="flex items-center px-3">
                    <input id="checkbox-{entry}" type="checkbox" name="list-checkbox" class="w-3 h-3" checked={selectedFeatures.includes(entry) ? true : false}>
                    <label for="checkbox-{entry}" class="w-full py-2 ms-2 text-[13px] text-gray-900 dark:text-gray-300">{entry}</label>
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="overflow-x-auto max-w-full mt-5">
      <table class="text-left w-full">
        <colgroup>
          <col span="1" class="w-[5%]">
          <col span="1" class="w-[80%]">
          <col span="1" class="w-[13%]">
          <col span="1" class="w-[2%]">
        </colgroup>
        <thead class="text-xs uppercase text-gray-800 dark:text-gray-300 bg-gray-100 dark:bg-gray-700">
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
                <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight"><div title="{item["description"]}" use:highlight={[getSearchKeys($term), getPath(item)]}></div></td>
                <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight"><div title="{getEnumValues(item)}" use:highlight={[getSearchKeys($term), item["type"]]}></div></td>
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
  </div>
  <Footer home={false}/>
</div>