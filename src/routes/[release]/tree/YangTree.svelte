<script lang="ts">
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	
	import { pathFocus } from '$lib/components/sharedStore';

	export let expanded = true;
	export let modelName: string;
	export let name: string;
	export let children: any[];
	export let details: string;
	export let urlPath: string[];
	const dump = details;

	// LOCAL FUNCTIONS
	const toggle = () => expanded = !expanded
	const isCrossLaunched = () => $page.data.crossLaunched
	const getPageUrlPath = () => $page.url.searchParams.get("path")?.trim()
	
	const pushNonEmptyChildrenToLast = (arr: any[]) => {
		const nonEmptyListObjects = arr.filter((obj: { children: any[]; }) => Array.isArray(obj.children) && obj.children.length > 0);
		const emptyListObjects = arr.filter((obj: { children: any[]; }) => Array.isArray(obj.children) && obj.children.length === 0);
		return emptyListObjects.concat(nonEmptyListObjects);
	}

	// EXPAND OVERRIDE IF PATH PARAM IN URL
	function openContainer(target: any) {
		if(target.name === urlPath[0]) {
			urlPath.shift();
			return true
		} else {
			return false
		}
	}

	function isUrlPathLeaf(target: any) {
		if(target.name === urlPath[0]) {
			urlPath.shift()
			if(!isCrossLaunched()) pathFocus.set(target.details)
			return true
		}
		return false
	}

	function leafClick(details: any) {
		pathFocus.set(details);
		$page.url.searchParams.delete("from");
		$page.url.searchParams.set("path", details.path);
		goto(`?${$page.url.searchParams.toString()}`);
	}
</script>

{#if modelName == name}
	<p class="flex items-center dark:text-gray-300 py-0.5">Tree Browser</p>
{:else}
	<button class="flex items-center py-0.5 {expanded ? 'text-gray-400 dark:text-gray-500': 'dark:text-gray-300'} hover:text-green-600 hover:dark:text-green-600" on:click={toggle}>
		<span class="flex pr-1">
			<!--minus-circle-->
			<svg class="w-5 h-5 {expanded ? 'minus-circle-active': 'hidden'}" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
			</svg>
			<!--plus-circle-->
			<svg class="w-5 h-5 {expanded ? 'plus-circle-inactive hidden': ''}" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
			</svg>
		</span>
		<span class="flex">{name}</span>
	</button>
{/if}

{#if expanded}
	<ul class="ml-2.5 px-2 list-none border-l dark:border-gray-300">
		{#each pushNonEmptyChildrenToLast(children) as entry}
			<li class="pt-1">
				{#if entry.children.length > 0}
					<svelte:self {modelName} {...entry} expanded={openContainer(entry)} urlPath={urlPath} />
				{:else}
					{@const trigger = isUrlPathLeaf(entry)}
					{@const currentFocus = ("path" in $pathFocus ? $pathFocus.path : getPageUrlPath())}
					<button class="ml-2.5 px-2 py-0.5 rounded hover:underline 
						hover:bg-gray-200 hover:text-black hover:dark:bg-gray-600 hover:dark:text-gray-200 
						{currentFocus === entry.details.path ? 'bg-gray-200 dark:bg-gray-600 dark:text-gray-200' : 'text-blue-600 dark:text-blue-500'}" on:click={() => leafClick(entry.details)}>
						<div title="{entry.details.path}">{entry.name}</div>
					</button>
				{/if}
			</li>
		{/each}
	</ul>
{/if}