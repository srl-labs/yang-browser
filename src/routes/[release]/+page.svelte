<script lang="ts">
  import { writable, derived } from 'svelte/store'
  import { fade } from 'svelte/transition'

  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Popup from '$lib/components/Popup.svelte';
  import { closeSidebar, extractFeatures, searchBasedFilter, featureBasedFilter, markFilter, markRender } from '$lib/components/functions'
  import type { PayLoad } from '$lib/structure'

	export let data: PayLoad;
  let {model, modelTitle, release, allModels, paths, urlPath, features} = data;
  let [platforms, uniqueFeatures] = extractFeatures(features);

  // Defaults
  let count = 40;
  let pathDetail = {};
  let showMoreFilters = false;
  const stateValues = [
		{ label: "All", value: "" },
		{ label: "State", value: "R" },
		{ label: "Config", value: "RW" }
	]

  // Writable Stores
  let searchInput = urlPath;
  let searchStore = writable("");
  $: searchStore.set(searchInput.trim().toLowerCase());

  let stateInput = "";
  let stateStore = writable("");
  $: stateStore.set(stateInput);

  let showPathPrefix = false;
  let prefixStore = writable(false)
  $: prefixStore.set(showPathPrefix)

  let platformSearch = "";
  let platFind = writable("");
  $: platFind.set(platformSearch.trim().toUpperCase());

  let platOption = "7220-IXR-D2L"
  let platSelect = writable("");
  $: platSelect.set(platOption)

  let featureSearch = "";
  let featFind = writable("");
  $: featFind.set(featureSearch.trim().toLowerCase());

  let start = writable(0);
  let yangPaths = writable(paths);

  let platStore = writable<string[]>([]);
  let featStore = writable<string[]>([]);
  let featDeviate = writable<string[]>([]);
  let featExtra = writable<string[]>([]);

  if(Object.keys(platforms)?.length) platStore.set(Object.keys(platforms));
  if(uniqueFeatures?.length) featStore.set(uniqueFeatures);

  // Feature based filter
  function featFilterAction (platFeatures: string[], deviation: string[], extras: string[]) {
    if(platFeatures?.length) {
      platFeatures = platFeatures.filter(f => !deviation.includes(f))
      return platFeatures.concat(extras)
    } else return []
  }

  // Derived Stores
  let platList = derived([platFind, platStore], ([$platFind, $platStore]) => $platStore?.length ? $platStore.filter((x: string) => x.includes($platFind)) : []);
  let featList = derived([featFind, featStore], ([$featFind, $featStore]) => $featStore?.length ? $featStore.filter((x: string) => x.includes($featFind)) : []);

  let featSelect = derived(platSelect, ($platSelect) => $platSelect != "" && Object.keys(platforms)?.length ? platforms[$platSelect]: []);
  let featFilter = derived([featSelect, featDeviate, featExtra], ([$featSelect, $featDeviate, $featExtra]) => featFilterAction($featSelect, $featDeviate, $featExtra));
  
  let stateFilter = derived([stateStore, yangPaths], ([$stateStore, $yangPaths]) => $yangPaths.filter((x: any) => $stateStore == "" ? true : x["is-state"] == $stateStore));
  let searchFilter = derived([searchStore, stateFilter, prefixStore], ([$searchStore, $stateFilter, $prefixStore]) => $stateFilter.filter((x: any) => searchBasedFilter(x, $searchStore, $prefixStore)));

  let platFeatFilter = derived([featFilter, searchFilter],  ([$featFilter, $searchFilter]) => $featFilter?.length ? $searchFilter.filter((x: any) => featureBasedFilter(x, $featFilter)) : $searchFilter);

  let total = derived(platFeatFilter, ($platFeatFilter) => {start.set(0); return $platFeatFilter.length});
  let end = derived([start, total], ([$start, $total]) => ($start + count) <= $total ? ($start + count) : $total);

  let paginated = derived([start, end, platFeatFilter], ([$start, $end, $platFeatFilter]) => $platFeatFilter.slice($start, $end));

  // Update Table Pagination
  const updateTable = (s: number) => {if(s >= 0 && s < $total) start.set(s)}

  // Reset feature deviations and extras
  function resetFeatSelect() {
    featDeviate.set([])
    featExtra.set([])
  }

  // Update feature deviations and extras
  function updateFeatDeviate (event: any, feat: string) {
    const checked = (event.target as HTMLInputElement)?.checked;
    let fd = $featDeviate
    let fe = $featExtra
    if(!checked && $featSelect.includes(feat) && !fd.includes(feat)) {
      fd.push(feat)
      featDeviate.set(fd)
    }
    else if(checked && $featSelect.includes(feat) && fd.includes(feat)) {
      fd = fd.filter(item => item !== feat)
      featDeviate.set(fd)
    }
    else if(checked && !$featSelect.includes(feat) && !fe.includes(feat)) {
      fe.push(feat)
      featExtra.set(fe)
    }
    else if(!checked && !$featSelect.includes(feat) && fe.includes(feat)) {
      fe = fe.filter(item => item !== feat)
      featExtra.set(fe)
    }
  }
</script>

<svelte:head>
	<title>Nokia SR Linux {release} {model !== "nokia" ? modelTitle : ""} Yang Model</title>
</svelte:head>

<Header model={model} modelTitle={modelTitle} release={release} allModels={allModels} home={true} />
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="min-w-[280px] overflow-x-auto font-nokia-headline-light dark:bg-gray-800 pt-[75px] lg:pt-[85px]" on:click={closeSidebar}>
  <div class="px-6 pt-6 container mx-auto">
    <p class="text-gray-800 dark:text-gray-300 font-nokia-headline">Path Browser</p>
    <div class="my-2 font-fira">
      <input type="text" bind:value={searchInput} placeholder="Search..." class="w-full text-[13px] px-3 py-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:placeholder-gray-400">
    </div>
    <div class="pt-2 pb-4 flex items-center space-x-4 text-gray-800 dark:text-gray-300 text-sm">
      {#each stateValues as entry}
        <div class="flex items-center">
          <input id="state-radio-{entry.label}" type="radio" class="w-4 h-4" bind:group={stateInput} value="{entry.value}">
          <label for="state-radio-{entry.label}" class="ml-2 cursor-pointer">{entry.label}</label>
        </div>
      {/each}
    </div>
    <div class="flex items-center">
      <div class="flex items-center px-3 py-1 w-fit border hover:border-gray-300 dark:border-gray-500 dark:hover:border-gray-400 rounded-full cursor-pointer">
        <input id="prefix-checkbox" type="checkbox" class="w-3 h-3 cursor-pointer" bind:checked={showPathPrefix}>
        <label for="prefix-checkbox" class="ms-2 text-xs text-gray-900 dark:text-gray-300 select-none cursor-pointer">Show prefix</label>
      </div>
      {#if uniqueFeatures?.length}
        <button class="flex items-center ml-2 px-3 py-1 w-fit text-xs rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white" on:click={() => showMoreFilters = !showMoreFilters}>
          {#if !showMoreFilters}
            <svg class="w-2 h-2 mr-1 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16"/>
            </svg>
          {/if}
          {#if showMoreFilters}
            <svg class="w-2 h-2 mr-1 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h16"/>
            </svg>
          {/if}
          Filters
        </button>
      {/if}
    </div>
    {#if showMoreFilters}
      <div transition:fade class="flex flex-wrap items-start mt-4 md:space-x-6">
        <div class="rounded-lg border border-gray-200 dark:border-gray-600 w-full md:w-40">
          <p class="px-4 py-2 font-nokia-headline text-gray-900 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 rounded-t-lg">Platform</p>
          <div class="p-2 border-b border-gray-200 dark:border-gray-600">
            <input type="text" id="platformSearch" bind:value={platformSearch} placeholder="Search..." class="w-full px-3 py-1 text-sm rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:placeholder-gray-400">
          </div>
          <div class="overflow-y-auto max-h-72 scroll-light dark:scroll-dark">
            <ul>
              {#each $platList as entry, i}
                <li class="w-full {i == 0 ? '' : 'border-t border-gray-200 dark:border-gray-600'}">
                  <div class="flex items-center px-3">
                    <input id="radio-{entry}" type="radio" name="list-radio" class="w-4 h-4 cursor-pointer text-blue-600 bg-gray-100 dark:bg-gray-600" bind:group={platOption} value="{entry}" on:change={resetFeatSelect}>
                    <label for="radio-{entry}" class="w-full cursor-pointer py-2 ms-2 text-sm {entry === $platSelect ? 'text-gray-900 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}">{entry}</label>
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        </div>
        <div class="rounded-lg border border-gray-200 dark:border-gray-600 w-full md:w-fit mt-5 md:mt-0">
          <p class="px-4 py-2 font-nokia-headline text-gray-900 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 rounded-t-lg">Features</p>
          <div class="p-2 border-b border-gray-200 dark:border-gray-600">
            <input type="text" id="featureSearch" bind:value={featureSearch} placeholder="Search..." class="w-full px-3 py-1 text-sm rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:placeholder-gray-400">
          </div>
          <div class="overflow-y-auto max-h-72 scroll-light dark:scroll-dark">
            <ul>
              {#each $featList as entry, i}
                <li class="w-full {i == 0 ? '' : 'border-t border-gray-200 dark:border-gray-600'}">
                  <div class="flex items-center px-3">
                    <input id="checkbox-{entry}" type="checkbox" name="list-checkbox" class="w-3 h-3 cursor-pointer" on:click={(e) => updateFeatDeviate(e, entry)} checked={$featFilter.includes(entry) ? true : false}>
                    <label for="checkbox-{entry}" class="w-full cursor-pointer py-2 ms-2 text-sm {$featSelect.includes(entry) ? 'text-gray-900 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}">{entry}</label>
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    {/if}
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
    <div class="overflow-x-auto rounded-t-lg max-w-full mt-2">
      <table class="text-left w-full">
        <colgroup>
          <col span="1" class="w-[5%]">
          <col span="1" class="w-[80%]">
          <col span="1" class="w-[15%]">
        </colgroup>
        <thead class="text-sm font-nokia-headline text-gray-800 dark:text-gray-300 bg-gray-300 dark:bg-gray-700">
          <tr>
            <th scope="col" class="px-3 py-2"></th>
            <th scope="col" class="px-3 py-2">Path</th>
            <th scope="col" class="px-3 py-2">Type</th>
          </tr>
        </thead>
        <tbody>
          {#if $total > 0}
            {#each $paginated as item}
              {@const path = markFilter((showPathPrefix ? item["path-with-prefix"] : item.path), $searchStore)}
              {@const type = markFilter(item.type, $searchStore)}
              <tr class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" on:click={() => pathDetail = item}>
                <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight">{item["is-state"]}</td>
                <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight group"><div use:markRender={path}></div></td>
                <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight"><div use:markRender={type}></td>
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
    <Popup pathDetail={pathDetail}/>
  </div>
  <Footer home={false}/>
</div>