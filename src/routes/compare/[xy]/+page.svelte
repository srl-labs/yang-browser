
<script lang="ts">
  import { onMount } from 'svelte';
	import { derived, writable } from 'svelte/store';

	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Popup from '$lib/components/Popup.svelte';
  import { extractFeatures, featureBasedFilter, highlight, searchBasedFilter } from '$lib/components/functions';

  // WORKER POST <- START
	import type { PathDef, Platforms } from '$lib/structure.js';
  import type { PostMessage, ResponseMessage } from "$lib/workers/structure";

  let diff: ResponseMessage[] = [] // IMPORTANT

  const onWorkerMessage = (event: MessageEvent<ResponseMessage[]>) => {
    diff = event.data;
    //console.log('Worker response received');
  };

  let compareWorker: Worker | undefined = undefined;

  const loadWorker = async (x: PathDef[], y: PathDef[]) => {
    const CompareWorker = await import('$lib/workers/compare.worker?worker');
    compareWorker = new CompareWorker.default();

    const message: PostMessage = { x, y }
    compareWorker.postMessage(message);

    compareWorker.onmessage = onWorkerMessage;
  }
  // WORKER POST <- END

  interface PageData {
    urlPath: string,
    x: string,
    y: string,
    model: string,
    xpaths: PathDef[],
    ypaths: PathDef[],
    yfeatures: Platforms
  }

  export let data: PageData
  const {urlPath, x, y, model, xpaths, ypaths, yfeatures} = data
  let [platforms, uniqueFeatures] = extractFeatures(yfeatures);

  onMount(() => loadWorker(xpaths, ypaths))

  // Defaults
  let count = 40;
  let pathDetail = {};
  let showMoreFilters = false;
  const compareValues = [
		{ label: "All", value: "" },
		{ label: "Added", value: "+" },
		{ label: "Deleted", value: "-" },
		{ label: "Modified", value: "~" }
	]
  
  // Writable Stores
  let searchInput = urlPath
  let searchStore = writable("")
  $: searchStore.set(searchInput.trim().toLowerCase())

  let compareInput = ""
  let compareStore = writable("")
  $: compareStore.set(compareInput)

  let platformSearch = "";
  let platFind = writable("");
  $: platFind.set(platformSearch.trim().toUpperCase());

  let platformValue = "7220-IXR-D2L";
  let platSelect = writable("");
  $: platSelect.set(platformValue);

  let start = writable(0);
  let yangPaths = writable<ResponseMessage[]>([]);
  $: yangPaths.set(diff)

  let platStore = writable<string[]>([]);
  if (Object.keys(platforms).length) {
    platStore.set(Object.keys(platforms));
  }

  // Derived Stores
  let platList = derived([platFind, platStore], ([$platFind, $platStore]) => $platStore?.length ? $platStore.filter((x: string) => x.includes($platFind)) : []);
  let featSelect = derived(platSelect, ($platSelect) => $platSelect != "" && Object.keys(platforms)?.length ? platforms[$platSelect]: []);

  let compareFilter = derived([compareStore, yangPaths], ([$compareStore, $yangPaths]) => $yangPaths.filter(x => $compareStore === "" ? true : x.compare === $compareStore));
  let searchFilter = derived([searchStore, compareFilter], ([$searchStore, $compareFilter]) => $compareFilter.filter(x => searchBasedFilter(x, $searchStore)));
  let platformFilter = derived([featSelect, searchFilter],  ([$featSelect, $searchFilter]) => $featSelect?.length ? $searchFilter.filter(x => featureBasedFilter(x, $featSelect)) : $searchFilter);

  let total = derived(platformFilter, ($platformFilter) => {start.set(0); return $platformFilter.length});
  let end = derived([start, total], ([$start, $total]) => ($start + count) <= $total ? ($start + count) : $total);
  let paginated = derived([start, end, platformFilter], ([$start, $end, $platformFilter]) => $platformFilter.slice($start, $end));

  // UPDATE TABLE PAGINATION
  const updateTable = (s: number) => {if(s >= 0 && s < $total) start.set(s)}

  function getSearchKeys(str: string) {
    return str.split(/\s+/).join("|")
  }
</script>


<svelte:head>
	<title>Nokia SR Linux Compare {x} to {y} Yang Model</title>
</svelte:head>


<Header model={model} modelTitle={"compare"} release={`${x};${y}`} home={true} />
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="min-w-[280px] overflow-x-auto font-nokia-headline-light dark:bg-gray-800 pt-[75px] lg:pt-[80px]">
  <div class="px-6 pt-6 container mx-auto">
    <div class="py-2 font-fira">
      <input type="text" bind:value={searchInput} placeholder="Search..." class="w-full text-[13px] px-3 py-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:placeholder-gray-400">
    </div>
    <div class="pt-2 pb-4 grid gap-2 grid-cols-2 md:flex md:items-center md:space-x-2 text-gray-800 dark:text-gray-300 text-sm">
      {#each compareValues as entry}
        <div class="flex items-center">
          <input id="compare-radio-{entry.label}" type="radio" class="w-4 h-4" bind:group={compareInput} value="{entry.value}">
          <label for="compare-radio-{entry.label}" class="ml-2 cursor-pointer">{entry.label}</label>
        </div>
      {/each}
    </div>
    {#if uniqueFeatures?.length}
      <button class="flex items-center px-3 py-1 w-fit rounded-lg text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white" on:click={() => showMoreFilters = !showMoreFilters}>
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
    <div class="mt-4 {showMoreFilters ? 'block' : 'hidden'}">
      <div class="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {#each $platList as entry}
          <div class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-300 hover:text-black dark:hover:bg-gray-900 dark:hover:text-white rounded-lg text-center {entry === $platSelect ? 'text-black dark:text-white bg-gray-300 dark:bg-gray-900' : 'text-gray-400 dark:text-gray-400'}">
            <input id="radio-{entry}" type="radio" class="sr-only cursor-pointer text-blue-600" bind:group={platformValue} value="{entry}">
            <label for="radio-{entry}" class="cursor-pointer">{entry}</label>
          </div>
        {/each}
      </div>
      <p class="text-xs mt-3 dark:text-gray-300"><span class="font-nokia-headline">Note:</span> Platforms listed are with respect to v{y}</p>
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
    <div class="overflow-x-auto rounded-t-lg max-w-full mt-2">
      <table class="text-left w-full text-xs">
        <colgroup>
          <col span="1" class="w-[3%]">
          <col span="1" class="w-[5%]">
          <col span="1" class="w-[72%]">
          <col span="1" class="w-[20%]">
        </colgroup>
        <thead class="text-sm font-nokia-headline text-gray-800 dark:text-gray-300 bg-gray-300 dark:bg-gray-700">
          <tr>
            <th scope="col" class="px-3 py-2"></th>
            <th scope="col" class="px-3 py-2">State</th>
            <th scope="col" class="px-3 py-2">Path</th>
            <th scope="col" class="px-3 py-2">Type</th>
          </tr>
        </thead>
        <tbody>
          {#if $total > 0}
            {#each $paginated as item}
              <tr class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:cursor-pointer" on:click={() => pathDetail = item}>
                <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight">{item.compare}</td>
                <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight">{item["is-state"]}</td>
                <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight">
                  <div use:highlight={[getSearchKeys($searchStore), (item.path)]}></div>
                </td>
                <td class="px-3 py-1.5 font-fira text-[13px] tracking-tight">
                  {#if item.compare === "~"}
                    <div class="inline-flex text-gray-400 dark:text-gray-500">from: <div class="ml-1" use:highlight={[getSearchKeys($searchStore), item.fromType]}></div></div>
                    <div use:highlight={[getSearchKeys($searchStore), item.type]}></div>
                  {:else}
                    <div use:highlight={[getSearchKeys($searchStore), item.type]}></div>
                  {/if}
                </td>
              </tr>
            {/each}
          {:else}
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td colspan="4" class="px-3 py-1.5 font-fira text-[13px] text-gray-400 dark:text-gray-500 text-center">Yang compare under process...</td>
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
