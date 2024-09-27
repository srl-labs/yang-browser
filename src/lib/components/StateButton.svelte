<script lang="ts">
  import { stateValues } from '$lib/components/sharedStore'

  export let stateInput = ""
</script>

<div class="dropdown">
  <button class="dropdown-button px-2 py-1 text-xs text-center text-nowrap rounded-lg inline-flex items-center dark:text-white 
    bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 
    border border-gray-200 dark:border-gray-600">
    {#if stateInput === ""}
      State & Config
      <svg class="w-2.5 h-2.5 ms-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
      </svg>
    {:else}
    <span class="font-fira text-gray-600 dark:text-gray-300 px-1">{stateInput}</span> - {stateValues.filter(x => x.value === stateInput)[0].label}
      <button class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-400" on:click={() => stateInput = ""}>
        <svg class="w-4 h-4 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z" clip-rule="evenodd"/>
        </svg>
      </button>
    {/if}
  </button>
  <div class="dropdown-content absolute z-10 hidden dark:text-white rounded-lg shadow
    bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
    <div class="my-1 overflow-y-auto scroll-light dark:scroll-dark">
      <ul>
        {#each stateValues as entry}
          {#if entry.value != ""}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <li class="flex items-center px-4 py-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer" on:click={() => stateInput = entry.value}>
              <p class="flex">
                <span class="font-fira text-gray-500 dark:text-gray-400 w-3 mr-2">{entry.value}</span>
                <span class="ml-1">{entry.label}</span>
              </p>
            </li>
          {/if}
        {/each}
      </ul>
    </div>
  </div>
</div>