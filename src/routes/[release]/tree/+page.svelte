<script lang="ts">
  import { writable, derived } from 'svelte/store';

  import type { TreePayLoad } from '$lib/structure';

  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import YangTree from './YangTree.svelte';

  import { pathFocus } from '$lib/components/sharedStore';

	export let data: TreePayLoad;
  let {urlPath, model, modelTitle, release, other, paths} = data;

  // DEFAULTS
	let pathDetail: any;
	pathFocus.subscribe((value) => {
    pathDetail = value;
  });

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
</script>

<svelte:head>
	<title>SR Linux {release} Tree Browser</title>
</svelte:head>

<div class="min-w-[280px] overflow-x-auto dark:bg-gray-800 font-nokia-headline-light">
  <Header model={model} modelTitle={modelTitle} release={release} other={other} home={false} />
  <div class="p-6 overflow-x-auto text-sm container mx-auto">
    <div class="font-fira text-xs tracking-tight">
      <YangTree modelName="{release}" name={$yangTarget.name} children={$yangTarget.children} details={$yangTarget.details} urlPath={urlPath} />
    </div>
    <div class="relative z-10 { Object.keys(pathDetail).length != 0  ? '' : 'hidden'}" aria-labelledby="modal-title">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full justify-center p-4 items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 max-w-xl">
            <div class="flex px-4 py-2 items-center justify-between bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 rounded-t-lg">
              <p class="flex text-lg text-gray-900 dark:text-gray-300">Path Details</p>
              <button class="flex text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-500" on:click={() => pathFocus.set({})}>
                <svg class="w-5 h-5" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </button>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 p-5">
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
                      <td class="py-1 px-2 dark:text-gray-300 font-fira text-[13px] tracking-tight  align-top">{pathDetail["description"]}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer home={false}/>
  </div>
</div>
