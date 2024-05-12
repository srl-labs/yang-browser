<script lang="ts">
  import { writable, derived } from 'svelte/store';

  import type { PathDef, TreePayLoad } from '$lib/structure';
  import { pathFocus } from '$lib/components/sharedStore';

  import { closeSidebar, removeKeyDefault } from '$lib/components/functions'

  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Popup from '$lib/components/Popup.svelte';
  import YangTree from './YangTree.svelte';

	export let data: TreePayLoad;
  let {urlPath, model, modelTitle, release, allModels, paths} = data;
  let yangTreeUrlPath = urlPath != "" ? (removeKeyDefault(urlPath).split("/").filter(x => x != "")) : []

  // DEFAULTS
  pathFocus.set({});
	let pathDetail = {};
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
      let clean = removeKeyDefault(xpath);
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
	<title>SR Linux {release} {model !== "nokia" ? modelTitle : ""} Tree Browser</title>
</svelte:head>

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
