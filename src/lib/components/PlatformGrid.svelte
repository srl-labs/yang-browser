<script lang="ts">
  import { fade } from "svelte/transition"

  export let showPlatformFilters: boolean
  export let supportedPlatforms: string[]
  export let platformSelected: string
</script>

{#if showPlatformFilters && supportedPlatforms?.length}
  <div transition:fade class="mt-4 grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-4">
    {#each supportedPlatforms as entry}
      <input id="platform-{entry}" type="radio" class="hidden peer" bind:group={platformSelected} value="{entry}"/>
      <label for="platform-{entry}" class="px-3 py-1 text-xs dark:text-white rounded-lg text-center cursor-pointer 
        {entry === platformSelected ? 
          'text-white dark:text-white bg-blue-600 dark:bg-blue-700' : 
          'text-black dark:text-gray-400 bg-gray-100 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-500'}">{entry}
      </label>
    {/each}
  </div>
{/if}