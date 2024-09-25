<script lang="ts">
	import { fade } from "svelte/transition";

  export let enabled: number
  export let showPlatformGrid = false
</script>

{#if enabled}
  <button class="flex items-center px-3 py-1 rounded-lg text-xs text-nowrap 
      text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600" 
      on:click={() => showPlatformGrid = !showPlatformGrid}>
    {#if !showPlatformGrid}
      <svg class="w-2 h-2 mr-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16"/>
      </svg>
    {:else}
      <svg class="w-2 h-2 mr-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h16"/>
      </svg>
    {/if}
    Platform Filters
  </button>
{/if}