<script lang="ts">
	import { browser } from "$app/environment";
	import { onMount } from "svelte";

  import type { Releases } from '$lib/structure';

  import yaml from 'js-yaml';
  import rel from '$lib/releases.yaml?raw';
  const allReleases = yaml.load(rel) as Releases;
  const validReleases = Object.keys(allReleases);

  let darkMode = false;
  let showDrop = false;

  export let release: string;
  export let home: boolean;

  // THEME HANDLER
  onMount(() => {
    if(browser) {
      if(localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        darkMode = true;
      } else {
        darkMode = false;
      }
      themeIconSwitch();
    }
  })

  const themeIconSwitch = () => {
    if(darkMode) {
      document.documentElement.classList.add("dark");
      document.getElementById("toggle-light-icon")?.classList.add("hidden");``
      document.getElementById("toggle-dark-icon")?.classList.remove("hidden");
    } else {
      document.documentElement.classList.remove("dark");
      document.getElementById("toggle-light-icon")?.classList.remove("hidden");
      document.getElementById("toggle-dark-icon")?.classList.add("hidden");
    }
  }

  const toggleDarkMode = () => {
    darkMode = !darkMode;
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    themeIconSwitch();
  }

</script>

{#if !validReleases.includes(release) }
  <div class="has-header-img py-6 px-10">
    <div class="flex justify-between">
      <div class="flex items-center">
        <a class="flex" href="../"><img src="/images/nwhite.png" width="70" alt="Logo"/></a>
      </div>
      <div class="flex items-center">
        <p class="flex text-white text-lg md:text-xl font-light">{release}</p>
      </div>
      <div class="flex items-center">
        <a href="#">
          <svg class="w-4 h-4 text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
          </svg>
        </a>
        <button class="flex w-8 h-5 ml-4 rounded-full items-center transition duration-30 {darkMode ? 'bg-gray-500' : 'bg-gray-300'}" on:click={toggleDarkMode}>
          <div id="switch-toggle" class="w-5 h-5 p-1 relative rounded-full transition duration-500 transform {darkMode ? 'bg-gray-600 translate-x-3' : 'bg-white -translate-x-0' }">
            <svg id="toggle-light-icon" class="text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg id="toggle-dark-icon" class="text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  </div>
{:else}
  <div class="has-header-img p-6">
    <div class="flex justify-between">
      <div class="flex items-center">
        <a class="flex" href="../"><img src="/images/nwhite.png" width="70" alt="Logo"/></a>
      </div>
      <div class="flex items-center">
        <a class="flex" href="https://network.developer.nokia.com/api-documentation/yang-models-234" target="_blank">
          <svg class="w-5 h-5 text-white hover:text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z" clip-rule="evenodd"/>
          </svg>
        </a>
        <button class="flex w-8 h-5 ml-4 rounded-full items-center transition duration-30 {darkMode ? 'bg-gray-500' : 'bg-gray-300'}" on:click={toggleDarkMode}>
          <div id="switch-toggle" class="w-5 h-5 p-1 relative rounded-full transition duration-500 transform {darkMode ? 'bg-gray-600 translate-x-3' : 'bg-white -translate-x-0' }">
            <svg id="toggle-light-icon" class="text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg id="toggle-dark-icon" class="text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
        </button>
      </div>
    </div>
    <div class="md:mt-12 md:my-10 mb-6 mt-8">
      <p class="text-xl md:text-3xl text-white font-light">NSP {release} {home ? 'Path' : 'Tree'} Browser</p>
    </div>
    <div class="text-right">
      <a class="text-xs bg-white hover:bg-gray-200 text-black py-1 px-3 rounded-full text-center" href="/{release}{home ? '/tree' : ''}">{home ? 'Tree' : 'Path'} Browser</a>
    </div>
  </div>
{/if}