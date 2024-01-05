<script lang="ts">
	import { browser } from "$app/environment";
	import { onMount } from "svelte";

  let darkMode = false;

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

<div class="has-header-img py-5">
  <div class="px-6 container mx-auto">
    <div class="flex justify-between">
      <div class="flex items-center">
        <a class="flex mr-3" href="../"><img src="/images/nokia_b.png" width="80" alt="Logo"/></a>
      </div>
      <div class="flex items-center">
        <div class="dropdown ml-3 relative">
          <button class="dropdown-button text-center inline-flex items-center text-xs">
            <svg class="w-4 h-4 hover:text-blue-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6.143 1H1.857A.857.857 0 0 0 1 1.857v4.286c0 .473.384.857.857.857h4.286A.857.857 0 0 0 7 6.143V1.857A.857.857 0 0 0 6.143 1Zm10 0h-4.286a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286A.857.857 0 0 0 17 6.143V1.857A.857.857 0 0 0 16.143 1Zm-10 10H1.857a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286A.857.857 0 0 0 7 16.143v-4.286A.857.857 0 0 0 6.143 11Zm10 0h-4.286a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286a.857.857 0 0 0 .857-.857v-4.286a.857.857 0 0 0-.857-.857Z"/>
            </svg>
          </button>
          <div id="dropdownHover" class="dropdown-content absolute right-0 z-10 hidden w-36 bg-white rounded-lg shadow">
            <ul class="py-2 text-sm text-gray-700">
              <li>
                <a class="flex items-center px-4 py-2 hover:bg-gray-100" href="/{release}{home ? '/tree' : ''}">
                  <svg class="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 1v4a1 1 0 0 1-1 1H1m5 8.514L4 12.5l2-2m4 4.014 2-2.014-2-2m5 7.5a.97.97 0 0 1-.933 1H1.933A.97.97 0 0 1 1 18V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 5.828 1h8.239A.97.97 0 0 1 15 2v16Z"/>
                  </svg>
                  {home ? 'Tree' : 'Path'} Browser
                </a>
              </li>
              <li>
                <a class="flex items-center px-4 py-2 hover:bg-gray-100" href="/releases/{release}/tree.txt" target="_blank">
                  <svg class="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm9-10v.4A3.6 3.6 0 0 1 8.4 9H6.61A3.6 3.6 0 0 0 3 12.605M14.458 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>
                  </svg>
                  Tree
                </a>
              </li>
              <li>
                <a class="flex items-center px-4 py-2 hover:bg-gray-100" href="/releases/{release}/paths.txt" target="_blank">
                  <svg class="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.828 10h6.239m-6.239 4h6.239M6 1v4a1 1 0 0 1-1 1H1m14-4v16a.97.97 0 0 1-.933 1H1.933A.97.97 0 0 1 1 18V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 5.828 1h8.239A.97.97 0 0 1 15 2Z"/>
                  </svg>
                  Paths
                </a>
              </li>
              <li>
                <a class="flex items-center px-4 py-2 hover:bg-gray-100" href="https://github.com/nokia/srlinux-yang-models/tree/{release}" target="_blank">
                  <svg class="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z" clip-rule="evenodd"/>
                  </svg>
                  Source
                </a>
              </li>
            </ul>
          </div>
        </div>
        <button class="flex w-8 h-5 ml-4 mb-1.5 rounded-full items-center transition duration-30 {darkMode ? 'bg-gray-500' : 'bg-gray-400'}" on:click={toggleDarkMode}>
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
    <div class="py-10">
      <p class="text-nokia-old-blue font-light text-3xl">SR Linux <a class="hover:text-blue-700 font-normal" href="/{release}">{release}</a></p>
      <p class="text-gray-800">{home ? 'Path' : 'Tree'} Browser</p>
    </div>
  </div>
</div>