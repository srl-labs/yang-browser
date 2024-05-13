<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { writable } from 'svelte/store';

  import type { TreePayLoad } from '$lib/structure';
  import { pathFocus } from '$lib/components/sharedStore';

  import { closeSidebar, removeKeyDefault } from '$lib/components/functions'

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

  let yangTreeUrlPath = urlPath != "" ? (removeKeyDefault(urlPath).split("/").filter(x => x != "")) : []

  // DEFAULTS
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
      <div class="font-fira text-xs tracking-tight">
        <YangTree modelName="{release}" name={$yangTarget.name} children={$yangTarget.children} details={$yangTarget.details} urlPath={yangTreeUrlPath} />
      </div>
      <Popup pathDetail={pathDetail}/>
      <Footer home={false}/>
    </div>
  </div>
{/if}