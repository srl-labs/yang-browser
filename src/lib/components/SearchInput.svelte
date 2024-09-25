<script lang="ts">
  export let searchInput: string = ""
</script>

<div class="my-2 font-fira">
  <input type="text" bind:value={searchInput} placeholder="Search..." 
    class="px-3 py-2 rounded-lg w-full text-[12.5px] 
      text-gray-900 dark:text-white dark:placeholder-gray-400 
      border border-gray-300 dark:border-gray-600 
      bg-gray-50 dark:bg-gray-700">
</div>