<script lang="ts">
  import { page } from '$app/stores'
	import { copy } from 'svelte-copy'

  import { closeSidebar, markRender } from '$lib/components/functions'

  export let popupDetail: any = {}
  export let platformSelected: string
  const treePopup = () => $page.url.pathname.includes("tree") ? true : false

  function closePopup() {
    if(Object.keys(popupDetail).length !== 0) {
      popupDetail = {}
    }
  }

  function closeSidebarPopup(event: any) {
    if(!document.getElementById("popupContent")?.contains(event.target)) {
      closeSidebar()
      closePopup()
    }
  }

  function copyContent(path: string) {
    const pageUrl = $page.url
    const model = $page.data.model
    const modelParam = (model !== "nokia" ? `&model=${model}` : "")
    const compareParam = (pageUrl.pathname === "/compare" ? `&${pageUrl.search.substring(1)}` : '')
    return `${pageUrl.origin}${pageUrl.pathname}?path=${encodeURIComponent(path)}${modelParam}${compareParam}`
  }

  function crossLaunch(path: any) {
    const model = $page.data.model
    const toTree = (treePopup() ? "" : "/tree")
    const fromParam = (treePopup() ? "" : "&from=pb")
    const modelParam = (model !== "nokia" ? `&model=${model}` : "")
    let platParam = `&platform=${platformSelected.toUpperCase()}`
    if(platformSelected === "platformCompare") {
      if(popupDetail.compare === "~") {
        platParam = `&platform=${$page.data.y}`
      } else if(popupDetail.compare === "+") {
        platParam = `&platform=${$page.data.y}`
      } else if(popupDetail.compare === "-") {
        platParam = `&platform=${$page.data.x}`
      }
    }
    const release = "release" in path ? `v${path.release}` : $page.data.release
    return `/${release}${toTree}?path=${encodeURIComponent(path.path)}${platParam}${fromParam}${modelParam}`
  }

  function copyEffect() {
    const toggle = () => {
      document.getElementById("clip")?.classList.toggle("hidden")
      document.getElementById("copied")?.classList.toggle("hidden")
    }
    setTimeout(toggle, 1000)
    toggle()
  }
</script>

<svelte:window on:keyup={({key}) => key === "Escape" ? closePopup() : ""}/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if Object.keys(popupDetail).length !== 0}
  <div id="popup" class="fixed p-4 inset-0 z-50 items-center { Object.keys(popupDetail).length !== 0  ? '' : 'hidden'}" on:click|stopPropagation={closeSidebarPopup}>
    <div class="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity"></div>
    <div id="popupContent" class="flex min-h-full justify-center items-center">
      <div class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-700 text-left shadow-xl transition-all sm:my-8 max-w-4xl">
        <div id="popupHeader" class="flex items-center justify-between px-4 py-2 rounded-t bg-gray-200 dark:bg-gray-600 border-b border-gray-200 dark:border-gray-600">
          <div class="flex items-center">
            <span class="text-lg text-gray-900 dark:text-gray-300">Path Details</span>
            <button class="ml-3 p-0.5 rounded-lg text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white hover:cursor-pointer" use:copy={copyContent(popupDetail.path)} on:svelte-copy={copyEffect}>
              <svg id="clip" class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M9 8v3a1 1 0 0 1-1 1H5m11 4h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1m4 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.13a1 1 0 0 1 .24-.65L7.7 8.35A1 1 0 0 1 8.46 8H13a1 1 0 0 1 1 1Z"/>
              </svg>
              <svg id="copied" class="w-5 h-5 hidden" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5"/>
              </svg>
            </button>
          </div>
          <button type="button" class="text-gray-500 hover:bg-gray-300 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-700 dark:hover:text-white" on:click={closePopup}>
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span class="sr-only">Close modal</span>
          </button>
        </div>
        <div id="popupBody" class="p-4 text-left">
          <div class="overflow-x-auto max-w-full">
            <table>
              <tbody>
                {#if "compare" in popupDetail}
                  <tr>
                    {#if popupDetail.compare === "~"}
                      <td colspan="2" class="pt-1 pb-3 text-sm text-gray-400 dark:text-gray-400">MODIFIED in {platformSelected === "platformCompare" ? '' : 'v'}{popupDetail.compareTo}</td>
                    {:else if popupDetail.compare === "+"}
                      <td colspan="2" class="pt-1 pb-3 text-sm text-green-600 dark:text-green-300">PRESENT in {platformSelected === "platformCompare" ? '' : 'v'}{popupDetail.compareTo}</td>
                    {:else if popupDetail.compare === "-"}
                      <td colspan="2" class="pt-1 pb-3 text-sm text-red-600 dark:text-red-300">NOT PRESENT in {platformSelected === "platformCompare" ? '' : 'v'}{popupDetail.compareTo}</td>
                    {/if}
                  </tr>
                {/if}
                <tr>
                  <th scope="row" class="py-1 whitespace-nowrap text-sm dark:text-gray-400">Data:</th>
                  <td class="py-1 px-2 dark:text-gray-300 font-fira text-[13px] tracking-tight">{popupDetail["is-state"] === "RW" ? "config" : "state"}</td>
                </tr>
                <tr class="border-t border-gray-200 dark:border-gray-600">
                  <th scope="row" class="py-1 whitespace-nowrap text-sm dark:text-gray-400">Type:</th>
                  <td class="py-1 px-2 dark:text-gray-300 font-fira text-[13px] tracking-tight">
                    {#if "fromType" in popupDetail}
                      <p class="text-gray-400">from (v{popupDetail.fromRel}): {popupDetail.fromType}</p>
                    {/if}
                    <p>{popupDetail.type}</p>
                  </td>
                </tr>
                {#if popupDetail["type"] === "enumeration" && "enum-values" in popupDetail}
                  <tr class="border-t border-gray-200 dark:border-gray-600">
                    <th scope="row" class="py-1 whitespace-nowrap text-sm dark:text-gray-400">Enum Values:</th>
                    <td class="py-1 px-2 dark:text-gray-300 font-fira text-[13px] tracking-tight">{popupDetail["enum-values"].join(", ")}</td>
                  </tr>
                {/if}
                <tr class="border-t border-gray-200 dark:border-gray-600">
                  <th scope="row" class="py-1 whitespace-nowrap text-sm dark:text-gray-400">Path:</th>
                  <td class="py-1 px-2 dark:text-gray-300 font-fira text-[13px] tracking-tight">{popupDetail.path}</td>
                </tr>
                <tr class="border-t border-gray-200 dark:border-gray-600">
                  <th scope="row" class="py-1 whitespace-nowrap text-sm dark:text-gray-400">Description:</th>
                  <td class="py-1 px-2 dark:text-gray-300 font-fira text-[13px] tracking-tight">
                    <div class="overflow-y-auto max-h-40 scroll-light dark:scroll-dark" use:markRender={"description" in popupDetail ? popupDetail.description.replaceAll("\n", "<br>") : ''}></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div id="popupFooter" class="text-right p-4 border-t border-gray-200 rounded-b dark:border-gray-600">
          <a href="{crossLaunch(popupDetail)}" target="_blank" class="text-sm px-3 py-1 rounded text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">Show in {"release" in popupDetail ? popupDetail.release : ''} {treePopup() ? 'Path' : 'Tree'} Browser</a>
        </div>
      </div>
    </div>
  </div>
{/if}