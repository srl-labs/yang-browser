<script lang="ts">
  import { writable, derived } from 'svelte/store';

  import type { TreePayLoad } from '$lib/structure';

  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import YangTree from './YangTree.svelte';

  import { pathFocus } from '$lib/components/sharedStore';

  /** @type {import('./$types').PageData} */
	export let data: TreePayLoad;
  let urlPath = data.path;
  let release = data.release;
  let paths = data.paths;

  // DEFAULTS
	let pathDetail = "";
	pathFocus.subscribe((value) => {
    pathDetail = value;
  });
  const scSplit = (str: string) => str.split(";");

  // TREE BUILDER
  class TreeNode {
    name: string;
    children: any[];
	  details: string;
    constructor(name: string, isKey: boolean, details: string) {
      isKey ? this.name = name + "*" : this.name = name
      this.children = [];
      this.details = details;
    }
  }

  function buildTreeFromPaths(rootName: string, paths: any) {
    const root = new TreeNode(rootName, false, "");

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

      segments.forEach((segment, i) => {
        if(segment.includes("[")) keys = extractBetween(segment);
        let childNode = currentNode.children.find((node: { name: string; }) => node.name === segment);

        if (!childNode) {
          let isKey = false;
          let paramPath = (i == (segLen - 1) ? xpath : "");
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

<div class="min-w-[280px] overflow-x-auto font-nokia-headline-light">
  <Header release={release} home={false} />
  <div class="p-6 dark:bg-gray-800 overflow-x-auto text-sm">
    <div class="font-fira text-[13px] tracking-tight">
      <YangTree modelName="NSP" name={$yangTarget.name} children={$yangTarget.children} details={$yangTarget.details} urlPath={urlPath} />
    </div>
    <div class="relative z-10 {pathDetail != '' ? '' : 'hidden'}" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full justify-center p-4 items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div class="bg-gray-50 dark:bg-gray-700 p-5">
              <div class="flex items-center justify-between">
                <h3 class="flex text-lg font-semibold dark:text-gray-300">Path Details</h3>
                <button class="flex text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-500" on:click={() => pathFocus.set("")}>
                  <svg class="w-5 h-5" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </button>
              </div>
              <hr class="my-2"/>
              <div class="overflow-x-auto max-w-full">
                <table>
                  <tbody>
                    <tr>
                      <th scope="row" class="py-1 whitespace-nowrap uppercase text-xs dark:text-gray-400">State:</th>
                      <td class="py-1 px-2 dark:text-gray-300 font-fira text-[13px] tracking-tight">{scSplit(pathDetail)[0]}</td>
                    </tr>
                    <tr>
                      <th scope="row" class="py-1 whitespace-nowrap uppercase text-xs dark:text-gray-400">Module:</th>
                      <td class="py-1 px-2 dark:text-gray-300 font-fira text-[13px] tracking-tight">{scSplit(pathDetail)[1]}</td>
                    </tr>
                    <tr>
                      <th scope="row" class="py-1 whitespace-nowrap uppercase text-xs dark:text-gray-400">Type:</th>
                      <td class="py-1 px-2 dark:text-gray-300 font-fira text-[13px] tracking-tight">{scSplit(pathDetail)[3]}</td>
                    </tr>
                    <tr>
                      <th scope="row" class="py-1 whitespace-nowrap uppercase text-xs dark:text-gray-400 align-text-top">Path:</th>
                      <td class="py-1 px-2 dark:text-gray-300 font-fira text-[13px] tracking-tight">{@html scSplit(pathDetail)[2]}</td>
                    </tr>
                    <tr>
                      <th scope="row" class="py-1 whitespace-nowrap uppercase text-xs dark:text-gray-400">Description:</th>
                      <td class="py-1 px-2 dark:text-gray-300 font-fira text-[13px] tracking-tight">{scSplit(pathDetail)[4]}</td>
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
