<script lang="ts">
  import Theme from '$lib/components/Theme.svelte';

  import { toggleSidebar, closeSidebar } from '$lib/components/functions'

  export let model: string;
  export let modelTitle: string;
  export let release: string;
  export let allModels: any = [];
  export let home: boolean;
</script>

<svelte:window on:keyup={({key}) => key === "Escape" ? closeSidebar() : ""} />

<!-- NAVBAR -->
<nav class="fixed top-0 z-20 p-4 w-screen select-none font-nokia-headline-light bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
	<div class="flex justify-between">
		<!-- navbar left item -->
		<div class="flex items-center space-x-2">
      <button type="button" class="flex dark:text-gray-200" on:click={toggleSidebar}>
        <svg id="open-sidebar" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"></path>
        </svg>
        <svg id="close-sidebar" class="w-5 h-5 hidden" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
			<a href="../" class="flex px-2"><img src="/images/navbar-logo.png" alt="Logo" width="25"/></a>
		</div>
		<!-- navbar centre item -->
    <div class="text-center">
      {#if modelTitle === "compare"}
        {@const [x, y] = release.split(";")}
        <p class="text-nokia-old-blue dark:text-white font-light text-lg lg:text-2xl">Yang Compare</p>
        <p class="text-gray-800 text-xs lg:text-sm dark:text-white">
          SR Linux <span class="font-nokia-headline">{x}</span> with <span class="font-nokia-headline">{y}</span>
        </p>
      {:else}
        <p class="text-nokia-old-blue dark:text-white font-light text-lg lg:text-2xl">SR Linux <span class="font-nokia-headline">{release}</span></p>
        <p class="text-gray-800 text-xs lg:text-sm dark:text-white">{modelTitle} YANG Model</p>
      {/if}
    </div>
		<!-- navbar right item -->
    <div class="flex items-center">
		  <Theme/>
    </div>
	</div>
</nav>

<!-- SIDEBAR -->
<div id="sidebar" class="fixed h-screen overflow-hidden transform transition ease-in-out duration-300 -translate-x-full">
  <aside class="text-sm font-nokia-headline-light pb-4 overflow-y-auto scroll-light dark:scroll-dark z-20 w-[220px] h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
    <div class="px-4 space-y-4 pt-[95px] lg:pt-[100px]">

      {#if allModels.length === 2}
        {@const nokiaModel = allModels.filter(x => x.title === "Nokia")[0]}
        {@const ocModel = allModels.filter(x => x.title === "OpenConfig")[0]}
        <div class="flex flex-row justify-between items-center text-center rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white">
          <a data-sveltekit-reload href="{nokiaModel.path}" class="basis-1/2 rounded-s-lg px-2 py-1 {model === "nokia" ? 'bg-blue-700 dark:bg-blue-700 text-white' : 'hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white'}">{nokiaModel.title}</a>
          <a data-sveltekit-reload href="{ocModel.path}" class="basis-1/2 rounded-r-lg px-2 py-1 {model === "openconfig" ? 'bg-blue-700 dark:bg-blue-700 text-white' : 'hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white'}">{ocModel.title}</a>
        </div>
      {/if}
      
      <ul class="space-y-2 text-gray-800 dark:text-gray-300">
        <li>
          <a data-sveltekit-reload class="flex items-center px-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 hover:rounded-lg" href="/{release}{home ? '/tree' : ''}{model !== "nokia" ? "/?model=" + model : ""}">
            <svg class="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm9-10v.4A3.6 3.6 0 0 1 8.4 9H6.61A3.6 3.6 0 0 0 3 12.605M14.458 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>
            </svg>
            {home ? 'Tree' : 'Path'} Browser
          </a>
        </li>
        <li>
          <a data-sveltekit-reload class="flex items-center px-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 hover:rounded-lg" href="/releases/{release}/{model !== "nokia" ? model + "/" : ""}tree.txt" target="_blank">
            <svg class="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.828 10h6.239m-6.239 4h6.239M6 1v4a1 1 0 0 1-1 1H1m14-4v16a.97.97 0 0 1-.933 1H1.933A.97.97 0 0 1 1 18V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 5.828 1h8.239A.97.97 0 0 1 15 2Z"/>
            </svg>
            Tree
          </a>
        </li>
        <li>
          <a data-sveltekit-reload class="flex items-center px-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 hover:rounded-lg" href="/releases/{release}/{model !== "nokia" ? model + "/" : ""}paths.txt" target="_blank">
            <svg class="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.828 10h6.239m-6.239 4h6.239M6 1v4a1 1 0 0 1-1 1H1m14-4v16a.97.97 0 0 1-.933 1H1.933A.97.97 0 0 1 1 18V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 5.828 1h8.239A.97.97 0 0 1 15 2Z"/>
            </svg>
            Paths
          </a>
        </li>
        <li>
          <a data-sveltekit-reload class="flex items-center px-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 hover:rounded-lg" href="/releases/{release}/{model !== "nokia" ? model + "/" : ""}tree.html" target="_blank">
            <svg class="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm9-10v.4A3.6 3.6 0 0 1 8.4 9H6.61A3.6 3.6 0 0 0 3 12.605M14.458 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>
            </svg>
            Pyang Tree
          </a>
        </li>
        <li>
          <a data-sveltekit-reload class="flex items-center px-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 hover:rounded-lg" href="https://github.com/nokia/srlinux-yang-models/tree/{release}" target="_blank">
            <svg class="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z" clip-rule="evenodd"/>
            </svg>
            Source
          </a>
        </li>
      </ul>
    </div>
  </aside>
</div>