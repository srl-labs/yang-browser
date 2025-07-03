
<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/stores'

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
	
  import type { PlatformComparePayLoad } from '$lib/structure'
  import type { PlatformComparePostMessage, DiffResponseMessage } from '$lib/workers/structure'
  import { compareStore, paginated, searchStore, stateStore, total, yangPaths } from './store'
  import { markFilter, markRender, toLower } from '$lib/components/functions'

  // DEFAULTS
  let popupDetail = {}
  let diff: DiffResponseMessage[] = []
  let workerComplete = false

  // COMPARE WORKER
  let compareWorker: Worker | undefined = undefined
  async function loadWorker(urlOrigin: string, release: string, x: string, y: string, xFeatures: string[], yFeatures: string[]) {
    const CompareWorker = await import('$lib/workers/platformCompare.worker?worker')
    compareWorker = new CompareWorker.default()
    const message: PlatformComparePostMessage = { urlOrigin, release, x, y, xFeatures, yFeatures }
    compareWorker.postMessage(message)
    compareWorker.onmessage = onWorkerMessage
  }
  function onWorkerMessage(event: MessageEvent<DiffResponseMessage[]>) {
    diff = event.data
    workerComplete = true
  }

  // ON PAGELOAD
  export let data: PlatformComparePayLoad
  const {x, y, model, release, xFeatures, yFeatures, urlPath} = data
  onMount(() => loadWorker($page.url.origin, release, x, y, xFeatures, yFeatures))

  // OTHER BINDING VARIABLES
  let searchInput = urlPath
  let compareInput = ""
  let stateInput = ""

  $: searchStore.set(toLower(searchInput))
  $: compareStore.set(compareInput)
  $: stateStore.set(stateInput)
  $: yangPaths.set(diff)
</script>

<svelte:head>
	<title>Nokia SR Linux Compare {x} to {y} Yang Model</title>
</svelte:head>

{#if !workerComplete}
  <Loading/>
{:else if $yangPaths.length > 0}
  <Header {model} modelTitle={"platformCompare"} release={`${release};${x};${y}`} home={true} />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="min-w-[280px] overflow-x-auto font-nokia-headline-light dark:bg-gray-800 pt-[75px] lg:pt-[80px]">
    <div class="px-6 pt-6 container mx-auto">
      <SearchInput bind:searchInput />
      <div class="overflow-x-auto scroll-light dark:scroll-dark">
        <div class="py-2 space-x-2 flex items-center text-sm">
          <ChangesButton bind:compareInput />
          <StateButton bind:stateInput />
        </div>
      </div>
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
      <Popup {popupDetail} platformSelected={"platformCompare"} />
    </div>
    <Footer home={false}/>
  </div>
{:else}
  <ComparePopup {x} {y}/>
{/if}