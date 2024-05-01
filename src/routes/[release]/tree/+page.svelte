<script lang="ts">
  import { writable, derived } from 'svelte/store';
  import { page } from "$app/stores";
  import { copy } from 'svelte-copy';

  import type { TreePayLoad } from '$lib/structure';
  import { closeSidebar, copyEffect } from '$lib/components/functions'

  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import YangTree from './YangTree.svelte';

  import { pathFocus } from '$lib/components/sharedStore';

	export let data: TreePayLoad;
  let {urlPath, model, modelTitle, release, allModels, paths} = data;
  let yangTreeUrlPath = urlPath != "" ? (urlPath.split("/").filter(x => x != "")) : []

  // DEFAULTS
	let pathDetail: any;
	pathFocus.subscribe((value) => {
    pathDetail = value;
  });
  pathFocus.set({});

  // TREE BUILDER
  class TreeNode {
    name: string;
    children: any[];
	  details: any | PathDef;
    constructor(name: string, isKey: boolean, details: any | PathDef) {
      isKey ? this.name = name + "*" : this.name = name
      this.children = [];
      this.details = details;
    }
  }

  function buildTreeFromPaths(rootName: string, paths: any) {
    const root = new TreeNode(rootName, false, {});

    const extractBetween = (str: string) => {
      const regex = /\[(.*?)\]/g;
      const matches = [];
      let match;
      while ((match = regex.exec(str)) !== null) {
        matches.push(match[1]);
      }
      return matches;
    };

    let keys: string[] = [];
    for (const entry of paths) {
      let currentNode = root;

      let xpath = entry["path"];
      let clean = xpath.replaceAll("=*", "");
      let segments = clean.split("/").slice(1);
      let segLen = segments.length;

      segments.forEach((segment: string, i: number) => {
        if(segment.includes("[")) keys = extractBetween(segment);
        let childNode = currentNode.children.find((node: { name: string; }) => node.name === segment);

        if (!childNode) {
          let isKey = false;
          let paramPath = (i == (segLen - 1) ? entry : {});
          if(keys.length > 0 && keys.includes(segment)) isKey = true;
          childNode = new TreeNode(segment, isKey, paramPath);
          if(isKey) {
            currentNode.children = [childNode].concat(currentNode.children)
          }
          else currentNode.children.push(childNode);
        }

        currentNode = childNode;
      })
    }
    return root;
  }

  // WRITABLE STORES
  let yangPaths = writable(paths);
  let yangTarget = derived(yangPaths, ($yangPaths) => buildTreeFromPaths(release, $yangPaths));

  // Page functions
  function closePopup() {
    if(Object.keys(pathDetail).length !== 0) {
      pathFocus.set({});
    }
  }
  
  function closeSidebarPopup(event: any) {
    if(!document.getElementById("popupContent")?.contains(event.target)) {
      closeSidebar();
      closePopup();
    }
  }
</script>

<svelte:head>
	<title>SR Linux {release} {model !== "nokia" ? modelTitle : ""} Tree Browser</title>
</svelte:head>

<svelte:window on:keyup={({key}) => key === "Escape" ? closePopup() : ""}/>

<Header model={model} modelTitle={modelTitle} release={release} allModels={allModels} home={false} />
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="min-w-[280px] overflow-x-auto dark:bg-gray-800 font-nokia-headline-light pt-[80px] lg:pt-[90px]" on:click={closeSidebar}>
  <div class="p-6 overflow-x-auto text-sm container mx-auto">
    <div class="font-fira text-xs tracking-tight">
      <YangTree modelName="{release}" name={$yangTarget.name} children={$yangTarget.children} details={$yangTarget.details} urlPath={yangTreeUrlPath} />
    </div>
    <div id="popup" class="fixed p-4 inset-0 z-50 items-center { Object.keys(pathDetail).length !== 0  ? '' : 'hidden'}" on:click|stopPropagation={closeSidebarPopup}>
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div id="popupContent" class="flex min-h-full justify-center items-center">
        <div class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-700 text-left shadow-xl transition-all sm:my-8 max-w-xl">
          <div id="popupHeader" class="flex items-center justify-between px-4 py-2 rounded-t bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div class="flex items-center">
              <span class="text-lg text-gray-900 dark:text-gray-300">Path Details</span>
              <button class="ml-3 p-0.5 rounded-lg text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white hover:cursor-pointer" use:copy={$page.url.toString()} on:svelte-copy={copyEffect}>
                <svg id="clip" class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M9 8v3a1 1 0 0 1-1 1H5m11 4h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1m4 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.13a1 1 0 0 1 .24-.65L7.7 8.35A1 1 0 0 1 8.46 8H13a1 1 0 0 1 1 1Z"/>
                </svg>
                <svg id="copied" class="w-5 h-5 hidden" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5"/>
                </svg>
              </button>
            </div>
            <button type="button" class="text-gray-500 hover:bg-gray-300 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" on:click={() => pathFocus.set({})}>
              <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
              <span class="sr-only">Close modal</span>
            </button>
          </div>
          <div id="popupBody" class="p-4 text-left">
            <div class="overflow-x-auto max-w-full">
              <table>
                <tbody>
                  <tr>
                    <th scope="row" class="py-1 whitespace-nowrap uppercase text-xs dark:text-gray-400">State:</th>
                    <td class="py-1 px-2 dark:text-gray-300 font-fira text-[13px] tracking-tight">{"is-state" in pathDetail ? pathDetail["is-state"] : false}</td>
                  </tr>
                  <tr class="border-t border-gray-200 dark:border-gray-600">
                    <th scope="row" class="py-1 whitespace-nowrap uppercase text-xs dark:text-gray-400">Type:</th>
                    <td class="py-1 px-2 dark:text-gray-300 font-fira text-[13px] tracking-tight">{pathDetail["type"]}</td>
                  </tr>
                  {#if pathDetail["type"] === "enumeration" && "enum-values" in pathDetail}
                    <tr class="border-t border-gray-200 dark:border-gray-600">
                      <th scope="row" class="py-1 whitespace-nowrap uppercase text-xs dark:text-gray-400">Enum Values:</th>
                      <td class="py-1 px-2 dark:text-gray-300 font-fira text-[13px] tracking-tight">{pathDetail["enum-values"].join(", ")}</td>
                    </tr>
                  {/if}
                  <tr class="border-t border-gray-200 dark:border-gray-600">
                    <th scope="row" class="py-1 whitespace-nowrap uppercase text-xs dark:text-gray-400">Path:</th>
                    <td class="py-1 px-2 dark:text-gray-300 font-fira text-[13px] tracking-tight">{pathDetail["path"]}</td>
                  </tr>
                  <tr class="border-t border-gray-200 dark:border-gray-600">
                    <th scope="row" class="py-1 whitespace-nowrap uppercase text-xs dark:text-gray-400">Description:</th>
                    <td class="py-1 pl-2 dark:text-gray-300 font-fira text-[13px] tracking-tight align-top">
                      <div class="overflow-y-auto max-h-40 scroll-light dark:scroll-dark">{pathDetail["description"]}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <Footer home={false}/>
  </div>
</div>
