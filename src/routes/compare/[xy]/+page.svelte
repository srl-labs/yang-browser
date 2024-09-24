
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
	import { derived, writable } from 'svelte/store'
  import { fade } from 'svelte/transition'

	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Popup from '$lib/components/Popup.svelte';
  import Loading from '$lib/components/Loading.svelte';
	import ComparePopup from '$lib/components/ComparePopup.svelte';
  import { searchBasedFilter, markFilter, markRender, featureBasedFilter } from '$lib/components/functions';



  // WORKER POST <- START
	import type { PlatformFeatures, ComparePayLoad } from '$lib/structure';
  import type { ComparePostMessage, CompareResponseMessage, DiffResponseMessage } from "$lib/workers/structure";

  let mountComplete = false;
  let diff: DiffResponseMessage[] = []
  let platforms: PlatformFeatures = {}
  let uniqueFeatures: string[] = []
  let platformValue = "";

  const onWorkerMessage = (event: MessageEvent<CompareResponseMessage>) => {
    diff = event.data.diff;
    platforms = event.data.platforms;
    uniqueFeatures = event.data.uniqueFeatures;
    platformValue = "7220-IXR-D2L";
    mountComplete = true
    //console.log('Worker response received');
  };

  let compareWorker: Worker | undefined = undefined;

  const loadWorker = async (x: string, y: string, model: string, urlOrigin: string) => {
    const CompareWorker = await import('$lib/workers/compare.worker?worker');
    compareWorker = new CompareWorker.default();

    const message: ComparePostMessage = { x, y, model, urlOrigin }
    compareWorker.postMessage(message);

    compareWorker.onmessage = onWorkerMessage;
  }
  // WORKER POST <- END



  export let data: ComparePayLoad
  const {x, y, model, urlPath} = data

  onMount(() => loadWorker(x, y, model, $page.url.origin))

  // Defaults
  let count = 40;
  let pathDetail = {};
  let showMoreFilters = false;
  const compareValues = [
		{ label: "All", value: "" },
		{ label: "Added", value: "+" },
		{ label: "Removed", value: "-" },
		{ label: "Modified", value: "~" }
	]
  const stateValues = [
		{ label: "All", value: "" },
		{ label: "State", value: "R" },
		{ label: "Config", value: "RW" }
	]
  
  // Writable Stores
  let searchInput = urlPath
  let searchStore = writable("")
  $: searchStore.set(searchInput.trim().toLowerCase())

  let compareInput = ""
  let compareStore = writable("")
  $: compareStore.set(compareInput)

  let stateInput = "";
  let stateStore = writable("");
  $: stateStore.set(stateInput);

  let platformSearch = "";
  let platFind = writable("");
  $: platFind.set(platformSearch.trim().toUpperCase());

  let platSelect = writable("");
  $: platSelect.set(platformValue);

  let start = writable(0);
  let yangPaths = writable<DiffResponseMessage[]>([]);
  $: yangPaths.set(diff)

  let platStore = writable<string[]>([]);
  $: if(Object.keys(platforms)?.length) platStore.set(Object.keys(platforms));

  // Derived Stores
  let platList = derived([platFind, platStore], ([$platFind, $platStore]) => $platStore?.length ? $platStore.filter((x: string) => x.includes($platFind)) : []);
  let featSelect = derived(platSelect, ($platSelect) => $platSelect != "" && Object.keys(platforms)?.length ? platforms[$platSelect]: []);

  let compareFilter = derived([compareStore, yangPaths], ([$compareStore, $yangPaths]) => $yangPaths.filter(x => $compareStore === "" ? true : x.compare === $compareStore));
  let stateFilter = derived([stateStore, compareFilter], ([$stateStore, $compareFilter]) => $compareFilter.filter((x: any) => $stateStore == "" ? true : x["is-state"] == $stateStore));
  let searchFilter = derived([searchStore, stateFilter], ([$searchStore, $stateFilter]) => $stateFilter.filter(x => searchBasedFilter(x, $searchStore)));

  let platformFilter = derived([featSelect, searchFilter],  ([$featSelect, $searchFilter]) => $featSelect?.length ? $searchFilter.filter(x => featureBasedFilter(x, $featSelect)) : $searchFilter);

  let total = derived(platformFilter, ($platformFilter) => {start.set(0); return $platformFilter.length});
  let end = derived([start, total], ([$start, $total]) => ($start + count) <= $total ? ($start + count) : $total);
  let paginated = derived([start, end, platformFilter], ([$start, $end, $platformFilter]) => $platformFilter.slice($start, $end));

  // Update Table Pagination
  const updateTable = (s: number) => {if(s >= 0 && s < $total) start.set(s)}
</script>


<svelte:head>
	<title>Nokia SR Linux Compare {x} to {y} Yang Model</title>
</svelte:head>

{#if !mountComplete}
  <Loading/>
{:else if $yangPaths.length > 0}
  <Header model={model} modelTitle={"compare"} release={`${x};${y}`} home={true} />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="min-w-[280px] overflow-x-auto font-nokia-headline-light dark:bg-gray-800 pt-[75px] lg:pt-[80px]">
    <div class="px-6 pt-6 container mx-auto">
      <div class="py-2 font-fira">
        <input type="text" bind:value={searchInput} placeholder="Search..." class="w-full text-[13px] px-3 py-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:placeholder-gray-400">
      </div>
      <div class="overflow-x-auto scroll-light dark:scroll-dark">
        <div class="py-2 space-x-2 flex items-center text-sm">
          <div class="dropdown">
            <button class="dropdown-button px-2 py-1 text-xs border border-gray-200 bg-gray-100 hover:bg-gray-200 dark:border-gray-600 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-center inline-flex items-center">
              {#if compareInput === ""}
                Changes
                <svg class="w-2.5 h-2.5 ms-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                </svg>
              {:else}
                <span class="font-fira text-gray-600 dark:text-gray-300 pl-0.5 pr-1">{compareInput}</span> Changes
                <button class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-400" on:click={() => compareInput = ""}>
                  <svg class="w-4 h-4 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z" clip-rule="evenodd"/>
                  </svg>
                </button>
              {/if}
            </button>
            <div class="dropdown-content absolute z-10 hidden bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg shadow">
              <div class="my-2 overflow-y-auto scroll-light dark:scroll-dark">
                <ul>
                  {#each compareValues as entry}
                    {#if entry.value != ""}
                      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                      <li class="flex items-center px-4 py-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer" on:click={() => compareInput = entry.value}>
                        <p class="flex">
                          <span class="font-fira text-gray-500 dark:text-gray-400 w-3">{entry.value != "" ? entry.value : ""}</span>
                          <span class="ml-1">{entry.label}</span>
                        </p>
                      </li>
                      {/if}
                  {/each}
                </ul>
              </div>
            </div>
          </div>
          <div class="dropdown">
            <button class="dropdown-button px-2 py-1 text-xs border border-gray-200 bg-gray-100 hover:bg-gray-200 dark:border-gray-600 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-center inline-flex items-center">
              {#if stateInput === ""}
                State
                <svg class="w-2.5 h-2.5 ms-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                </svg>
              {:else}
                <span class="font-fira text-gray-600 dark:text-gray-300 px-1">{stateInput}</span> - {stateValues.filter(x => x.value === stateInput)[0].label}
                <button class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-400" on:click={() => stateInput = ""}>
                  <svg class="w-4 h-4 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z" clip-rule="evenodd"/>
                  </svg>
                </button>
              {/if}
            </button>
            <div class="dropdown-content absolute z-10 hidden bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg shadow">
              <div class="my-2 overflow-y-auto scroll-light dark:scroll-dark">
                <ul>
                  {#each stateValues as entry}
                    {#if entry.value != ""}
                      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                      <li class="flex items-center px-4 py-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer" on:click={() => stateInput = entry.value}>
                        <p class="flex">
                          <span class="font-fira text-gray-500 dark:text-gray-400 w-3 mr-2">{entry.value != "" ? entry.value : ""}</span>
                          <span class="ml-1">{entry.label}</span>
                        </p>
                      </li>
                    {/if}
                  {/each}
                </ul>
              </div>
            </div>
          </div>
          {#if uniqueFeatures?.length}
            <button class="flex items-center px-3 py-1 text-nowrap rounded-lg text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-500 dark:hover:bg-blue-600 border border-blue-200 dark:border-blue-600 dark:text-white" on:click={() => showMoreFilters = !showMoreFilters}>
              {#if !showMoreFilters}
                <svg class="w-2 h-2 mr-1 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16"/>
                </svg>
              {:else}
                <svg class="w-2 h-2 mr-1 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h16"/>
                </svg>
              {/if}
              Platform Filters
            </button>
          {/if}
          <div class="dropdown">
            <a href="https://github.com/nokia/srlinux-yang-models/compare/v{x}..v{y}" target="_blank" class="dropdown-button font-nokia-headline-light px-3 py-1 rounded-full text-xs text-nowrap bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white inline-flex items-center align-bottom">
              <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z" clip-rule="evenodd"/>
              </svg>
              <span class="ml-0.5">YANG diff</span>
            </a>
            <div class="dropdown-content absolute z-10 hidden bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg shadow">
              <p class="my-2 max-w-[300px] px-3 text-xs">
                Beyond the differences shown below, there might be changes in descriptions, type constraints, 
                or other yang statements which can be viewed from this link.
              </p>
            </div>
          </div>
        </div>
      </div>
      {#if showMoreFilters}
        <div transition:fade class="mt-4 grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {#each $platList as entry}
            <button class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-300 hover:text-black dark:hover:bg-gray-900 dark:hover:text-white rounded-lg text-center 
              {entry === $platSelect ? 'text-black dark:text-white bg-gray-300 dark:bg-gray-900' : 'text-gray-400 dark:text-gray-400'}" on:click={() => { platformValue = entry }}>{entry}
            </button>
          {/each}
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
        <table class="text-left w-full text-xs">
          <colgroup>
            <col span="1" class="w-[3%]">
            <col span="1" class="w-[2%]">
            <col span="1" class="w-[75%]">
            <col span="1" class="w-[20%]">
          </colgroup>
          <thead class="text-sm font-nokia-headline text-gray-800 dark:text-gray-300 bg-gray-300 dark:bg-gray-700">
            <tr>
              <th scope="col" class="px-3 py-2"></th>
              <th scope="col" class="px-3 py-2"></th>
              <th scope="col" class="px-3 py-2">Path</th>
              <th scope="col" class="px-3 py-2">Type</th>
            </tr>
          </thead>
          <tbody>
            {#if $total > 0}
              {#each $paginated as item}
              {@const path = markFilter(item.path, $searchStore)}
              {@const type = markFilter(item.type, $searchStore)}
                <tr class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:cursor-pointer" on:click={() => pathDetail = item}>
                  <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight">{item.compare}</td>
                  <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight">{item["is-state"]}</td>
                  <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight"><div use:markRender={path}></div></td>
                  <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight">
                    {#if item.compare === "~"}
                      {@const fromType = markFilter(item.fromType || "", searchInput)}
                      <div class="inline-flex text-gray-400 dark:text-gray-500">from: <div class="ml-1" use:markRender={fromType}></div></div>
                      <div use:markRender={type}></div>
                    {:else}
                      <div use:markRender={type}></div>
                    {/if}
                  </td>
                </tr>
              {/each}
            {:else}
              <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td colspan="4" class="px-3 py-1.5 font-fira text-[13px] text-gray-400 dark:text-gray-500 text-center">{mountComplete ? 'No results found' : 'Yang compare under process...'}</td>
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
{:else}
  <ComparePopup {x} {y}/>
{/if}