<script lang="ts">
	import { page } from "$app/stores";
	import { markFilter, markRender } from "$lib/components/functions";
	import { folderMatchesSearch, matchesSearch, urlPathPasson } from "./matchFunctions";
  import { pathFocus } from '$lib/components/sharedStore';
	import { goto } from "$app/navigation";

	export let folder;
  export let searchQuery: string;
  export let expanded: boolean;
  export let urlPath: string;
  
  // Manually expand or collapse folder in non-search context
  function toggle() {
    expanded = !expanded
  }

  // Get Page Parameter on-demand
  function getPageUrlPath() {
    return $page.url.searchParams.get("path")?.trim()
  }

  function leafClick(details: any) {
		pathFocus.set(details);
		$page.url.searchParams.delete("from");
		$page.url.searchParams.set("path", details.path);
		goto(`?${$page.url.searchParams.toString()}`, {noScroll: true});
	}
</script>

<button class="flex items-center text-left py-0.5 
  {expanded ? 'text-gray-400 dark:text-gray-500': 'dark:text-gray-300'} 
  hover:text-green-600 hover:dark:text-green-600" disabled={matchesSearch(folder, searchQuery, urlPath)} on:click={toggle}>
  <span class="flex pr-1">
    <!--minus-circle-->
    <svg class="w-5 h-5 {expanded ? 'minus-circle-active': 'hidden'}" fill="none" 
      stroke-width="1.5" stroke="currentColor" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
    <!--plus-circle-->
    <svg class="w-5 h-5 {expanded ? 'plus-circle-inactive hidden': ''}" fill="none" 
      stroke-width="1.5" stroke="currentColor" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  </span>
  <div use:markRender={markFilter(folder.name, searchQuery, "tree")} class="flex"></div>
</button>


{#if expanded}
  {#if folder.children && folder.children.length > 0}
    <ul class="ml-2.5 px-2 list-none border-l dark:border-gray-300">
      {#each folder.children as item}
        {#if item.type === "folder"}
          {@const childMatches = folderMatchesSearch(item, searchQuery, urlPath)}
          <li class="pt-1">
            <svelte:self folder={item} searchQuery={searchQuery} expanded={childMatches} urlPath={urlPathPasson(urlPath)} />
          </li>
        {:else}
          <li class="pt-1">
            <button class="ml-2.5 px-2 py-0.5 rounded hover:underline 
              hover:bg-gray-200 hover:text-black hover:dark:bg-gray-600 hover:dark:text-gray-200 
              {getPageUrlPath() === item.details.path ? 'bg-gray-200 dark:bg-gray-600 dark:text-gray-200' : 'text-blue-600 dark:text-blue-500'}" 
              on:click={() => leafClick(item.details)}>
              {#if getPageUrlPath() === item.details.path}
                <div title="{item.details.path}">{item.name}</div>
              {:else}
                <div title="{item.details.path}" use:markRender={markFilter(item.name, searchQuery, "tree")}></div>
              {/if}
            </button>
          </li>
        {/if}
      {/each}
    </ul>
  {/if}
{/if}
