<script lang="ts">
	import { page } from '$app/stores'
  import { copy } from 'svelte-copy'

  export let searchInput: string = ""

  function copyEffect() {
    const toggle = () => {
      document.getElementById(`search-clip`)?.classList.toggle("hidden")
      document.getElementById(`search-copied`)?.classList.toggle("hidden")
    }
    setTimeout(toggle, 1000)
    toggle()
  }

  function copySearchUrl(search: string) {
    const pageUrl = $page.url
    const model = $page.data.model
    const modelParam = (model !== "nokia" ? `&model=${model}` : "")
    return `${pageUrl.origin}${pageUrl.pathname}?path=${encodeURIComponent(search)}${modelParam}`
  }
</script>

<div class="my-2 font-fira">
  <div class="group relative">
    <input type="text" bind:value={searchInput} placeholder="Search..." 
    class="px-3 py-2 rounded-lg w-full text-[12.5px] 
      text-gray-900 dark:text-white dark:placeholder-gray-400 
      border border-gray-300 dark:border-gray-600 
      bg-gray-50 dark:bg-gray-700">
    {#if searchInput != ""}
      <button class="absolute top-2 right-2 hidden group-hover:inline-block rounded text-gray-500 dark:text-gray-400 hover:cursor-pointer" use:copy={copySearchUrl(searchInput)} on:svelte-copy={copyEffect}>
        <svg id="search-clip" class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M9 8v3a1 1 0 0 1-1 1H5m11 4h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1m4 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.13a1 1 0 0 1 .24-.65L7.7 8.35A1 1 0 0 1 8.46 8H13a1 1 0 0 1 1 1Z"/>
        </svg>
        <svg id="search-copied" class="w-5 h-5 hidden" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5"/>
        </svg>
      </button>
    {/if}
  </div>
</div>