<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { writable } from 'svelte/store';

  import type { TreePayLoad } from '$lib/structure';
  import { pathFocus } from '$lib/components/sharedStore';

  import { closeSidebar } from '$lib/components/functions'
  import { folderMatchesSearch, urlPathPasson } from "./matchFunctions";

  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Popup from '$lib/components/Popup.svelte';
  import Loading from '$lib/components/Loading.svelte';
  import YangTree from './YangTree.svelte';



  // WORKER POST <- START
  import type { FetchPostMessage, TreeResponseMessage } from "$lib/workers/structure";
	
  let mountComplete = false;
  let treePaths: TreeResponseMessage = {}

  const onWorkerMessage = (event: MessageEvent<TreeResponseMessage>) => {
    treePaths = event.data;
    mountComplete = true
  };

  let compareWorker: Worker | undefined = undefined;

  const loadWorker = async (model: string, release: string, urlOrigin: string) => {
    const CompareWorker = await import('$lib/workers/tree.worker?worker');
    compareWorker = new CompareWorker.default();

    const message: FetchPostMessage = { model, release, urlOrigin }
    compareWorker.postMessage(message);

    compareWorker.onmessage = onWorkerMessage;
  }
  // WORKER POST <- END
  


	export let data: TreePayLoad;
  let {model, modelTitle, urlPath, release, allModels} = data;

  onMount(() => loadWorker(model, release, $page.url.origin))

  // DEFAULTS
  let searchQuery = ""

  pathFocus.set({});
	let pathDetail = {};
	pathFocus.subscribe((value) => {
    pathDetail = value;
  });

  // Writable Stores
  let yangTarget = writable<TreeResponseMessage>({});
  $: yangTarget.set(treePaths)
</script>

<svelte:head>
	<title>SR Linux {release} {model !== "nokia" ? modelTitle : ""} Tree Browser</title>
</svelte:head>

{#if !mountComplete}
  <Loading/>
{:else if Object.keys($yangTarget)?.length}
  <Header model={model} modelTitle={modelTitle} release={release} allModels={allModels} home={false} />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="min-w-[280px] overflow-x-auto dark:bg-gray-800 font-nokia-headline-light pt-[80px] lg:pt-[90px]" on:click={closeSidebar}>
    <div class="p-6 overflow-x-auto text-sm container mx-auto">
      <div class="pb-5 font-fira">
        <input type="text" bind:value={searchQuery} placeholder="Search..." class="w-full text-[13px] px-3 py-2 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:placeholder-gray-400">
      </div>
      <div class="font-fira text-xs tracking-tight">
        {#each $yangTarget.children as folder}
          <YangTree folder={folder} searchQuery={searchQuery.trim().toLowerCase()} expanded={folderMatchesSearch(folder, searchQuery, urlPath)} urlPath={urlPathPasson(urlPath)} />
        {/each}
      </div>
      <Popup pathDetail={pathDetail}/>
      <Footer home={false}/>
    </div>
  </div>
{/if}