<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { fade } from 'svelte/transition'
  
  import Header from '$lib/components/Header.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import Popup from '$lib/components/Popup.svelte'
  import Loading from '$lib/components/Loading.svelte'

  import StateButton from '$lib/components/StateButton.svelte'
  import SearchInput from '$lib/components/SearchInput.svelte'
  import PlatformButton from '$lib/components/PlatformButton.svelte'
  import ShowPrefixCheck from '$lib/components/ShowPrefixCheck.svelte'
  import Pagination from './Pagination.svelte'

  import type { PayLoad, PathDef, PlatformFeatures } from '$lib/structure'
  import type { FetchPostMessage, FetchResponseMessage } from '$lib/workers/structure'
  import { toLower, toUpper, closeSidebar, markFilter, markRender } from '$lib/components/functions'
	import { featDeviate, featExtra, featFilter, featFind, featList, featSelect, featStore, paginated, platFeat, platFind, platList, platSelect, platStore, prefixStore, searchStore, stateStore, total, yangPaths } from './store'

  // DEFAULTS
  let popupDetail = {}
  let paths: PathDef[] = []
  let platformFeatures: PlatformFeatures = {}
  let uniqueFeatures: string[] = []
  let supportedPlatforms: string[] = []
  let workerComplete = false

  // RELEASE WORKER
  let releaseWorker: Worker | undefined = undefined
  async function loadWorker(model: string, release: string, urlOrigin: string) {
    const ReleaseWorker = await import('$lib/workers/fetch.worker?worker')
    releaseWorker = new ReleaseWorker.default()
    const message: FetchPostMessage = { model, release, urlOrigin }
    releaseWorker.postMessage(message)
    releaseWorker.onmessage = onWorkerMessage
  }
  function onWorkerMessage(event: MessageEvent<FetchResponseMessage>) {
    paths = event.data.paths
    platformFeatures = event.data.platformFeatures
    uniqueFeatures = event.data.uniqueFeatures
    if(Object.keys(platformFeatures)?.length) {
      supportedPlatforms = Object.keys(platformFeatures)
    }
    workerComplete = true
  }
  
  // ON PAGELOAD
  export let data: PayLoad
  let {model, modelTitle, urlPath, release, allModels} = data
  onMount(() => loadWorker(model, release, $page.url.origin))

  // OTHER BINDING VARIABLES
  let searchInput = urlPath
  let stateInput = ""
  let showPathPrefix = false
  let platformSearch = ""
  let featureSearch = ""
  let showPlatformFilters = false
  let platOption = data.platform

  $: searchStore.set(toLower(searchInput))
  $: stateStore.set(stateInput)
  $: prefixStore.set(showPathPrefix)
  $: platFeat.set(platformFeatures)
  $: platStore.set(supportedPlatforms)
  $: platFind.set(toUpper(platformSearch))
  $: platSelect.set(platOption)
  $: featStore.set(uniqueFeatures)
  $: featFind.set(toLower(featureSearch))
  $: yangPaths.set(paths)

  // RESET FEATURE DEVIATIONS AND EXTRAS
  function resetFeatSelect() {
    featDeviate.set([])
    featExtra.set([])
  }

  // UPDATE FEATURE DEVIATIONS AND EXTRAS
  function updateFeatDeviate (event: any, feat: string) {
    const checked = (event.target as HTMLInputElement)?.checked
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

{#if !workerComplete}
  <Loading/>
{:else if $yangPaths.length > 0}
  <Header {model} {modelTitle} {release} {allModels} home={true} {supportedPlatforms} platformSelected={$platSelect} />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="min-w-[280px] overflow-x-auto font-nokia-headline-light dark:bg-gray-800 pt-[75px] lg:pt-[85px]" on:click={closeSidebar}>
    <div class="px-6 pt-6 container mx-auto">
      <p class="text-gray-800 dark:text-gray-300 font-nokia-headline">Path Browser</p>
      <SearchInput bind:searchInput />
      <div class="overflow-x-auto scroll-light dark:scroll-dark">
        <div class="py-2 space-x-2 flex items-center">
          <StateButton bind:stateInput />
          <PlatformButton enabled={supportedPlatforms?.length} bind:showPlatformFilters {platOption} />
          <ShowPrefixCheck bind:showPathPrefix />
        </div>
      </div>
      {#if model == "openconfig"}
        <p class="mt-2 text-yellow-600 dark:text-yellow-400 text-xs">Note: The OpenConfig browser does not take into account the SRL deviations.</p>
      {/if}
      {#if showPlatformFilters}
        <div transition:fade class="flex flex-wrap items-start mt-4 md:space-x-6">
          <div class="rounded-lg border border-gray-200 dark:border-gray-600 w-full md:w-40">
            <p class="px-4 py-2 font-nokia-headline text-gray-900 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 rounded-t-lg">Platform</p>
            <div class="p-2 border-b border-gray-200 dark:border-gray-600">
              <input type="text" id="platformSearch" bind:value={platformSearch} placeholder="Search..." class="w-full px-3 py-1 text-sm rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:placeholder-gray-400">
            </div>
            <div class="overflow-y-auto max-h-72 scroll-light dark:scroll-dark">
              <ul>
                <li class="w-full">
                  <div class="flex items-center px-3">
                    <input id="radio-plat-none" type="radio" name="list-radio" class="w-4 h-4 cursor-pointer text-blue-600 bg-gray-100 dark:bg-gray-600" bind:group={platOption} value="" on:change={resetFeatSelect}>
                    <label for="radio-plat-none" class="w-full cursor-pointer py-2 ms-2 text-sm {$platSelect === "" ? 'text-gray-900 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}">NONE</label>
                  </div>
                </li>
                {#each $platList as entry, i}
                  <li class="w-full border-t border-gray-200 dark:border-gray-600">
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
      <Pagination />
      <div class="overflow-x-auto rounded-t-lg max-w-full mt-2">
        <table class="text-left w-full">
          <colgroup>
            <col span="1" class="w-[2%]">
            <col span="1" class="w-[80%]">
            <col span="1" class="w-[18%]">
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
                <tr class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600" on:click={() => popupDetail = item}>
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
      <Pagination />
      <Popup {popupDetail} platformSelected={$platSelect} />
    </div>
    <Footer home={false}/>
  </div>
{/if}