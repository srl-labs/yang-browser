
<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { defaultPlatform } from '$lib/components/sharedStore'

	import Header from '$lib/components/Header.svelte'
  import Footer from '$lib/components/Footer.svelte'
	import Popup from '$lib/components/Popup.svelte'
  import Loading from '$lib/components/Loading.svelte'
	import ComparePopup from '$lib/components/ComparePopup.svelte'

  import SearchInput from '$lib/components/SearchInput.svelte'
  import StateButton from '$lib/components/StateButton.svelte'
	import ChangesButton from '$lib/components/ChangesButton.svelte'
	import PlatformButton from '$lib/components/PlatformButton.svelte'
  import PlatformGrid from '$lib/components/PlatformGrid.svelte'
  import Pagination from './Pagination.svelte'
	
  import type { PlatformFeatures, ComparePayLoad } from '$lib/structure'
  import type { ComparePostMessage, CompareResponseMessage, DiffResponseMessage } from '$lib/workers/structure'
  import { compareStore, paginated, platFeat, platFind, platSelect, searchStore, stateStore, total, yangPaths } from './store'
  import { markFilter, markRender, toLower, toUpper } from '$lib/components/functions'

  // DEFAULTS
  let popupDetail = {}
  let diff: DiffResponseMessage[] = []
  let platformFeatures: PlatformFeatures = {}
  let uniqueFeatures: string[] = []
  let supportedPlatforms: string[] = []
  let workerComplete = false

  // COMPARE WORKER
  let compareWorker: Worker | undefined = undefined
  async function loadWorker(x: string, y: string, model: string, urlOrigin: string) {
    const CompareWorker = await import('$lib/workers/compare.worker?worker')
    compareWorker = new CompareWorker.default()
    const message: ComparePostMessage = { x, y, model, urlOrigin }
    compareWorker.postMessage(message)
    compareWorker.onmessage = onWorkerMessage
  }
  function onWorkerMessage(event: MessageEvent<CompareResponseMessage>) {
    diff = event.data.diff
    platformFeatures = event.data.platformFeatures
    uniqueFeatures = event.data.uniqueFeatures
    if(Object.keys(platformFeatures)?.length) {
      supportedPlatforms = Object.keys(platformFeatures)
    }
    workerComplete = true
  }

  // ON PAGELOAD
  export let data: ComparePayLoad
  const {x, y, model, urlPath} = data
  onMount(() => loadWorker(x, y, model, $page.url.origin))

  // OTHER BINDING VARIABLES
  let searchInput = urlPath
  let compareInput = ""
  let stateInput = ""
  let platformSearch = ""
  let showPlatformFilters = false
  let platformSelected = defaultPlatform

  $: searchStore.set(toLower(searchInput))
  $: compareStore.set(compareInput)
  $: stateStore.set(stateInput)
  $: platFeat.set(platformFeatures)
  $: platFind.set(toUpper(platformSearch))
  $: platSelect.set(platformSelected)
  $: yangPaths.set(diff)
</script>

<svelte:head>
	<title>Nokia SR Linux Compare {x} to {y} Yang Model</title>
</svelte:head>

{#if !workerComplete}
  <Loading/>
{:else if $yangPaths.length > 0}
  <Header {model} modelTitle={"compare"} release={`${x};${y}`} home={true} />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="min-w-[280px] overflow-x-auto font-nokia-headline-light dark:bg-gray-800 pt-[75px] lg:pt-[80px]">
    <div class="px-6 pt-6 container mx-auto">
      <SearchInput bind:searchInput />
      <div class="overflow-x-auto scroll-light dark:scroll-dark">
        <div class="py-2 space-x-2 flex items-center text-sm">
          <ChangesButton bind:compareInput />
          <StateButton bind:stateInput />
          <PlatformButton enabled={supportedPlatforms?.length} bind:showPlatformFilters />
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
      <PlatformGrid bind:showPlatformFilters bind:supportedPlatforms bind:platformSelected />
      <Pagination />
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
                <tr class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:cursor-pointer" on:click={() => popupDetail = item}>
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
                <td colspan="4" class="px-3 py-1.5 font-fira text-[13px] text-gray-400 dark:text-gray-500 text-center">{workerComplete ? 'No results found' : 'Yang compare under process...'}</td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
      <Pagination />
      <Popup {popupDetail} platformSelected={$platSelect} />
    </div>
    <Footer home={false}/>
  </div>
{:else}
  <ComparePopup {x} {y}/>
{/if}