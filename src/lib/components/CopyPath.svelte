<script lang="ts">
  import { copy } from 'svelte-copy'

  export let pathType: string
  export let path: string

  function copyEffect() {
    const toggle = () => {
      document.getElementById(`${pathType}-clip`)?.classList.toggle("hidden")
      document.getElementById(`${pathType}-copied`)?.classList.toggle("hidden")
    }
    setTimeout(toggle, 1000)
    toggle()
  }
</script>

<button class="absolute right-2 hidden group-hover:inline-block ml-2 rounded   bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 hover:cursor-pointer" use:copy={path} on:svelte-copy={copyEffect}>
  <svg id="{pathType}-clip" class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M9 8v3a1 1 0 0 1-1 1H5m11 4h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1m4 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.13a1 1 0 0 1 .24-.65L7.7 8.35A1 1 0 0 1 8.46 8H13a1 1 0 0 1 1 1Z"/>
  </svg>
  <svg id="{pathType}-copied" class="w-5 h-5 hidden" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5"/>
  </svg>
</button>