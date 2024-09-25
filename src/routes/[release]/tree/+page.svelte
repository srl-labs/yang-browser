<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { derived, writable } from 'svelte/store';

  import type { PlatformFeatures, TreePayLoad } from '$lib/structure';

  import { pathFocus } from '$lib/components/sharedStore';
  import { closeSidebar, removeKeyDefault } from '$lib/components/functions'

  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import StateButton from '$lib/components/StateButton.svelte';
  import PlatformButton from '$lib/components/PlatformButton.svelte';
  import Popup from '$lib/components/Popup.svelte';
  import Loading from '$lib/components/Loading.svelte';
  import YangTree from './YangTree.svelte';


  // YangTree WORKER POST <- START
  import type { YangTreePostMessage, YangTreeResponseMessage } from "$lib/workers/structure";

  let treePaths: YangTreeResponseMessage = {}
  let pastYangTreeArgs = ""

  const onYangTreeWorkerMessage = (event: MessageEvent<YangTreeResponseMessage>) => {
    treePaths = event.data
    secondMountComplete = true
  };

  let yangTreeWorker: Worker | undefined = undefined;

  const loadYangTreeWorker = async (model: string, release: string, urlOrigin: string, searchInput: string, stateInput: string, featSelect: string[]) => {
    const YangTreeWorker = await import('$lib/workers/YangTree.worker?worker');
    yangTreeWorker = new YangTreeWorker.default();

    const yangTreeMessage: YangTreePostMessage = { model, release, urlOrigin, searchInput, stateInput, featSelect }
    yangTreeWorker.postMessage(yangTreeMessage);

    yangTreeWorker.onmessage = onYangTreeWorkerMessage;
  }
  // YangTree WORKER POST <- END



  // Tree WORKER POST <- START
  import type { FetchPostMessage, FetchResponseMessage } from "$lib/workers/structure";
	import PlatformGrid from "$lib/components/PlatformGrid.svelte";
	import SearchInput from "$lib/components/SearchInput.svelte";
	
  let firstMountComplete = false;
  let secondMountComplete = false;
  let platforms: PlatformFeatures = {}
  let supportedPlatforms: string[] = []
  let uniqueFeatures: string[] = []
  let platformSelected = ""

  const onReleaseWorkerMessage = (event: MessageEvent<FetchResponseMessage>) => {
    platforms = event.data.platforms;
    if(Object.keys(platforms)?.length) {
      supportedPlatforms = Object.keys(platforms)
    }
    uniqueFeatures = event.data.uniqueFeatures;
    platformSelected = "7220-IXR-D2L";
    firstMountComplete = true
    secondMountComplete = false

    let platformFeatures = Object.keys(platforms)?.length ? platforms[platformSelected]: []
    //pastYangTreeArgs = `${$page.data.urlPath};;;;${platformSelected}`
    //loadYangTreeWorker(model, release, $page.url.origin, $page.data.urlPath, "", platformFeatures)
    pastYangTreeArgs = `;;;;${platformSelected}`
    loadYangTreeWorker(model, release, $page.url.origin, "", "", platformFeatures)
  };

  let releaseWorker: Worker | undefined = undefined;

  const loadReleaseWorker = async (model: string, release: string, urlOrigin: string) => {
    const ReleaseWorker = await import('$lib/workers/fetch.worker?worker');
    releaseWorker = new ReleaseWorker.default();

    const releaseMessage: FetchPostMessage = { model, release, urlOrigin }
    releaseWorker.postMessage(releaseMessage);

    releaseWorker.onmessage = onReleaseWorkerMessage;
  }
  // Tree WORKER POST <- END
  

	export let data: TreePayLoad;
  let {model, modelTitle, urlPath, release, allModels} = data;

  onMount(() => loadReleaseWorker(model, release, $page.url.origin))

  // Defaults
  pathFocus.set({});
	let pathDetail = {};
	pathFocus.subscribe((value) => {
    pathDetail = value;
  });

  let showPlatformGrid = false;
  const stateValues = [
		{ label: "All", value: "" },
		{ label: "State", value: "R" },
		{ label: "Config", value: "RW" }
	]

  // Writable Stores
  let searchInput = "";
  let searchStore = writable("");
  $: searchStore.set(searchInput);

  let stateInput = "";
  let stateStore = writable("");
  $: stateStore.set(stateInput);

  let platSelect = writable("");
  $: platSelect.set(platformSelected)

  let yangTarget = writable<YangTreeResponseMessage>({});
  $: yangTarget.set(treePaths)

  // Derived Stores
  let yangTreeArgs = derived([searchStore, stateStore, platSelect], ([$searchStore, $stateStore, $platSelect]) => $searchStore + ";;" + $stateStore + ";;" + $platSelect)
  let featSelect = derived(platSelect, ($platSelect) => $platSelect != "" && Object.keys(platforms)?.length ? platforms[$platSelect]: []);
  
  function updateYangTree() {
    pastYangTreeArgs = $yangTreeArgs
    loadYangTreeWorker(model, release, $page.url.origin, searchInput, stateInput, $featSelect)
  }
</script>

<svelte:head>
	<title>SR Linux {release} {model !== "nokia" ? modelTitle : ""} Tree Browser</title>
</svelte:head>

{#if !firstMountComplete}
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
        <PlatformButton enabled={supportedPlatforms?.length} bind:showPlatformGrid />
      </div>
      <PlatformGrid bind:showPlatformGrid bind:supportedPlatforms bind:platformSelected />
      <div class="text-right mt-6">
        <button class="px-4 py-2 rounded-lg text-xs 
          {pastYangTreeArgs === $yangTreeArgs ? 'bg-green-100 dark:bg-green-900 text-gray-500 dark:text-gray-500 cursor-not-allowed' : 'text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'}" 
          disabled={pastYangTreeArgs === $yangTreeArgs} on:click={updateYangTree}>Apply
        </button>
      </div>
    </div>
    {#if Object.keys(treePaths)?.length}
      <div class="px-5 py-4 container mx-auto border-t dark:border-gray-600">
        <div class="font-fira text-xs tracking-tight">
          {#each $yangTarget.children as folder}
            <YangTree bind:folder urlPath={searchInput !== "" ? "" : urlPath} />
          {/each}
        </div>
        <Popup pathDetail={pathDetail}/>
        <Footer home={false}/>
      </div>
    {/if}
  </div>
{/if}