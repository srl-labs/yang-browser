<script lang="ts">
  import { copy } from "svelte-copy"
  
  import Header from "$lib/components/Header.svelte"
  import Footer from "$lib/components/Footer.svelte"

	import { closeSidebar, copyAnimation } from "$lib/components/functions"

  let isSubmitting = false
  let jsonRpcResponse = {}

  export let data
  let {model, modelTitle, allModels, urlPath, release} = data

  async function jsonRpcQuery(event: SubmitEvent) {
    isSubmitting = false

    const formData = new FormData(event.currentTarget as HTMLFormElement)
		let req: any = {}
    formData.forEach(function(value, key) {
      req[key] = value
    })
    
    const headers = new Headers()
    headers.set('Authorization', 'Basic ' + btoa(req.user + ":" + req.pass))

    const url = `${req.type}://${req.neId}/jsonrpc`
    const payload = {
      "id": 0,
      "jsonrpc": "2.0",
      "method": "get",
      "params": {
        "commands": [
          {
            "path": req.path,
            "datastore": req.datastore
          }
        ]
      }
  }

    const query = await fetch(url, {
      method: "POST", body: JSON.stringify(payload), headers: headers
    })
    if(query.ok) {
      const response = await query.json()
      if("result" in response) {
        jsonRpcResponse = response.result[0]
      } else {
        jsonRpcResponse = response
      }
    } else {
      jsonRpcResponse["error"] = await query.text()
    }
    isSubmitting = false
  }
</script>

<svelte:head>
	<title>Nokia SR Linux {release} {model !== "nokia" ? modelTitle : ""} Yang Model | Query</title>
</svelte:head>

<Header {model} {modelTitle} {release} {allModels} home={false} />
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="min-w-[280px] overflow-x-auto font-nokia-headline-light dark:bg-gray-800 pt-[75px] lg:pt-[85px]" on:click={closeSidebar}>
  <div class="px-6 pt-6 container mx-auto">
    <p class="text-gray-800 dark:text-gray-300 font-nokia-headline pb-1">JSON-RPC Query SR Linux</p>
    <form class="pt-4" method="POST" action="?/inventoryFind" on:submit|preventDefault={jsonRpcQuery}>
      <div class="grid grid-cols-1 md:grid-cols-[4fr_1fr] gap-4">
        <div>
          <label for="path" class="block uppercase text-gray-800 dark:text-gray-200 text-xs mb-2">Path*</label>
          <input id="path" name="path" type="text" required value="{urlPath}" class="font-fira px-3 py-2 rounded-lg w-full text-[12.5px] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 {isSubmitting ? 'bg-gray-300' : 'bg-gray-100'}" disabled={isSubmitting}>
        </div>
        <div>
          <label for="datastore" class="block uppercase text-gray-800 dark:text-gray-200 text-xs mb-2">Datastore*</label>
          <select id="datastore" name="datastore" class="font-fira px-3 py-2 rounded-lg w-full text-[12.5px] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 {isSubmitting ? 'bg-gray-300' : 'bg-gray-100'}" disabled={isSubmitting}>
            <option selected value="state">state</option>
            <option value="running">running</option>
            <option value="candidate">candidate</option>
            <option value="baseline">baseline</option>
            <option value="tools">tools</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div>
          <label for="neId" class="block uppercase text-gray-800 dark:text-gray-200 text-xs mb-2">Address*</label>
          <div class="flex items-center">
            <select id="type" name="type" class="font-fira px-3 py-2 rounded-l-lg text-[12.5px] border-t border-b border-l border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 pointer-events-none">
              <option selected value="http">HTTP</option>
              <option value="https">HTTPS</option>
            </select>
            <input id="neId" name="neId" type="text" required class="font-fira px-3 py-2 rounded-r-lg w-full text-[12.5px] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 {isSubmitting ? 'bg-gray-300' : 'bg-gray-100'}" disabled={isSubmitting}>
          </div>
        </div>
        <div>
          <label for="user" class="block uppercase text-gray-800 dark:text-gray-200 text-xs mb-2">Username*</label>
          <input id="user" name="user" type="text" required class="font-fira px-3 py-2 rounded-lg w-full text-[12.5px] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 {isSubmitting ? 'bg-gray-300' : 'bg-gray-100'}" disabled={isSubmitting}>
        </div>
        <div>
          <label for="pass" class="block uppercase text-gray-800 dark:text-gray-200 text-xs mb-2">Password*</label>
          <input id="pass" name="pass" type="password" required class="font-fira px-3 py-2 rounded-lg w-full text-[12.5px] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 {isSubmitting ? 'bg-gray-300' : 'bg-gray-100'}" disabled={isSubmitting}>
        </div>
      </div>
      <div class="flex items-center justify-end pt-4">
        <button type="submit" class="px-4 py-2 rounded-lg text-sm text-white bg-green-600 hover:bg-green-700 {isSubmitting ? 'animate-pulse' : ''}" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit'}</button>
      </div>
    </form>
    <div class="text-sm dark:text-white">
      <div class="overflow-x-auto scroll-light dark:scroll-dark space-y-4">
        <div class="flex items-center pt-4">
          <p class="font-semibold text-black dark:text-white">Response:</p>
          <button class="ml-2 p-0.5 rounded-lg text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white hover:cursor-pointer" on:click={copyAnimation} use:copy={JSON.stringify(jsonRpcResponse, null, 2)}>
            <svg id="clip" class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M9 8v3a1 1 0 0 1-1 1H5m11 4h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1m4 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.13a1 1 0 0 1 .24-.65L7.7 8.35A1 1 0 0 1 8.46 8H13a1 1 0 0 1 1 1Z"/>
            </svg>
            <svg id="copied" class="w-5 h-5 hidden" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5"/>
            </svg>
          </button>
        </div>
        <pre class="text-[12.5px]">{JSON.stringify(jsonRpcResponse, null, 2)}</pre>
      </div>
    </div>
  </div>
  <Footer home={false}/>
</div>
