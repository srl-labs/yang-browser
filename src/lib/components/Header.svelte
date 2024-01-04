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
        <a class="flex" href="../"><img src="/images/nokia_b.png" width="70" alt="Logo"/></a>
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
  <div class="p-6 has-header-img">
    <div class="flex justify-between">
      <div class="flex items-center">
        <a class="flex mr-2" href="../"><img src="/images/nokia_b.png" width="70" alt="Logo"/></a>
      </div>
      <div class="hidden md:flex items-center">
        <p class="text-nokia-old-blue text-xl">SR Linux <span class="font-extrabold">{release}</span> Yang Model</p>
      </div>
      <div class="flex items-center">
        <div class="dropdown ml-4">
          <button class="dropdown-button text-center inline-flex items-center py-1 px-2 bg-white hover:bg-gray-200 rounded-full text-xs">
            More
            <svg class="w-2 h-2 ms-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
            </svg>
          </button>
          <div id="dropdownHover" class="dropdown-content absolute z-10 hidden bg-white rounded-lg shadow overflow-y-auto">
            <ul class="py-2 text-sm text-gray-700">
              <li><a class="block px-4 py-2 hover:bg-gray-100" href="/{release}{home ? '/tree' : ''}" target="_blank">Tree Browser</a></li>
              <li><a class="block px-4 py-2 hover:bg-gray-100" href="#" target="_blank">Tree</a></li>
              <li><a class="block px-4 py-2 hover:bg-gray-100" href="#" target="_blank">Paths</a></li>
              <li><a class="block px-4 py-2 hover:bg-gray-100" href="#" target="_blank">Source</a></li>
            </ul>
          </div>
        </div>
        <button class="flex w-8 h-5 ml-3 rounded-full items-center transition duration-30 {darkMode ? 'bg-gray-500' : 'bg-gray-400'}" on:click={toggleDarkMode}>
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
    <div class="md:hidden pt-6 text-center">
      <p class="text-nokia-old-blue text-2xl">SR Linux <span class="font-extrabold">{release}</span></p>
      <p class="text-nokia-old-blue text-2xl">Yang Model</p>
    </div>
  </div>
{/if}