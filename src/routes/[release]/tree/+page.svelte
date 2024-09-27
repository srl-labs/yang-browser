<script lang="ts">
  import { onMount } from "svelte"
  import { page } from "$app/stores"
  import { goto } from "$app/navigation"

  import Header from '$lib/components/Header.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import SearchInput from "$lib/components/SearchInput.svelte"
  import StateButton from '$lib/components/StateButton.svelte'
  import PlatformButton from '$lib/components/PlatformButton.svelte'
	import PlatformGrid from '$lib/components/PlatformGrid.svelte'
  
  import YangTree from './YangTree.svelte'
  import Popup from '$lib/components/Popup.svelte'
  import Loading from '$lib/components/Loading.svelte'

  import { decideExpand } from "./expand"
  import { pathFocus } from '$lib/components/sharedStore'
  import { closeSidebar, toLower } from '$lib/components/functions'
  import { featSelect, platFeat, platSelect, searchStore, stateStore, yangTarget, yangTreeArgs } from "./store"

  import type { PlatformFeatures, TreePayLoad } from '$lib/structure'
  import type { FetchPostMessage, FetchResponseMessage, YangTreePostMessage, YangTreeResponseMessage } from "$lib/workers/structure"
  
  // DEFAULTS
  let popupDetail = {}
  let pastYangTreeArgs = ""
  let treePaths: YangTreeResponseMessage = {}
  let platformFeatures: PlatformFeatures = {}
  let supportedPlatforms: string[] = []
  let uniqueFeatures: string[] = []
  let treeWorkerComplete = false
  let yangTreeWorkerComplete = false

  // YANGTREE WORKER
  let yangTreeWorker: Worker | undefined = undefined
  async function loadYangTreeWorker (model: string, release: string, urlOrigin: string, searchInput: string, stateInput: string, featSelect: string[]) {
    const YangTreeWorker = await import('$lib/workers/yangTree.worker?worker')
    yangTreeWorker = new YangTreeWorker.default()
    const yangTreeMessage: YangTreePostMessage = { model, release, urlOrigin, searchInput, stateInput, featSelect }
    yangTreeWorker.postMessage(yangTreeMessage)
    yangTreeWorker.onmessage = onYangTreeWorkerMessage
  }
  function onYangTreeWorkerMessage(event: MessageEvent<YangTreeResponseMessage>) {
    treePaths = event.data
    yangTreeWorkerComplete = true
  }

  // TREE WORKER
  let treeWorker: Worker | undefined = undefined
  async function loadReleaseWorker(model: string, release: string, urlOrigin: string) {
    const ReleaseWorker = await import('$lib/workers/fetch.worker?worker')
    treeWorker = new ReleaseWorker.default()
    const releaseMessage: FetchPostMessage = { model, release, urlOrigin }
    treeWorker.postMessage(releaseMessage)
    treeWorker.onmessage = onReleaseWorkerMessage
  }
  function onReleaseWorkerMessage(event: MessageEvent<FetchResponseMessage>) {
    platformFeatures = event.data.platformFeatures
    if(Object.keys(platformFeatures)?.length) {
      supportedPlatforms = Object.keys(platformFeatures)
    }
    uniqueFeatures = event.data.uniqueFeatures
    treeWorkerComplete = true
    yangTreeWorkerComplete = false

    let featureSelected = platformFeatures[$page.data.platform]
    let searchInput = $page.data.crossLaunched ? "" : $page.data.urlPath
    pastYangTreeArgs = `${searchInput};;;;${platformSelected}`
    loadYangTreeWorker(model, release, $page.url.origin, searchInput, "", featureSelected)
  }

  // ON PAGELOAD
	export let data: TreePayLoad
  let {model, modelTitle, urlPath, crossLaunched, release, allModels} = data
  onMount(() => loadReleaseWorker(model, release, $page.url.origin))

  // OTHER BINDING VARIABLES
  let searchInput = crossLaunched ? "" : urlPath
  let stateInput = ""
  let platformSelected = data.platform
  let showPlatformFilters = false

  pathFocus.set({})
	pathFocus.subscribe((value) => {
    popupDetail = value
  })

  $: {
    searchStore.set(toLower(searchInput))
    stateStore.set(stateInput)
    platFeat.set(platformFeatures)
    platSelect.set(platformSelected)
    yangTarget.set(treePaths)
  }

  // TRIGGER SEARCH FILTERS
  function triggerApply() {
    if(pastYangTreeArgs !== $yangTreeArgs) {
      pastYangTreeArgs = $yangTreeArgs
      $page.url.searchParams.delete("from")
      if(searchInput != "") {
        $page.url.searchParams.set("path", searchInput)
      } else {
        $page.url.searchParams.delete("path")
      }
      goto(`?${$page.url.searchParams.toString()}`, {invalidateAll: true})
      loadYangTreeWorker(model, release, $page.url.origin, searchInput, stateInput, $featSelect)
    }
	}
</script>

<svelte:head>
	<title>SR Linux {release} {model !== "nokia" ? modelTitle : ""} Tree Browser</title>
</svelte:head>

<svelte:window on:keyup={({key}) => key === "Enter" ? triggerApply() : ""} />

{#if !treeWorkerComplete}
  <Loading/>
{:else}
  <Header model={model} modelTitle={modelTitle} release={release} allModels={allModels} home={false} />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="min-w-[280px] overflow-x-auto font-nokia-headline-light dark:bg-gray-800 pt-[75px] lg:pt-[85px]" on:click={closeSidebar}>
    <div class="px-6 py-7 container mx-auto">
      <p class="text-gray-800 dark:text-gray-300 font-nokia-headline">Tree Browser</p>
      <SearchInput bind:searchInput />
      <div class="flex py-1 items-center space-x-2">
        <StateButton bind:stateInput />
        <PlatformButton enabled={supportedPlatforms?.length} bind:showPlatformFilters />
      </div>
      <PlatformGrid bind:showPlatformFilters bind:supportedPlatforms bind:platformSelected />
      <div class="text-right mt-6">
        <button class="px-4 py-2 rounded-lg text-xs 
          {pastYangTreeArgs === $yangTreeArgs ? 'bg-green-100 dark:bg-green-900 text-gray-500 dark:text-gray-500 cursor-not-allowed' : 'text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'}" 
          disabled={pastYangTreeArgs === $yangTreeArgs} on:click={triggerApply}>Apply
        </button>
      </div>
    </div>
    {#if Object.keys($yangTarget)?.length}
      <div class="px-5 py-4 container mx-auto border-t dark:border-gray-600">
        <div class="font-fira text-xs tracking-tight">
          {#each $yangTarget.children as folder}
            <YangTree {folder} {crossLaunched} {urlPath} expanded={decideExpand(folder, crossLaunched, urlPath)} />
          {/each}
        </div>
        <Popup {popupDetail} />
        <Footer home={false}/>
      </div>
    {/if}
  </div>
{/if}