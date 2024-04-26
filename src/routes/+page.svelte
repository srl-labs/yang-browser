<script lang="ts">
  import yaml from 'js-yaml';
  import rel from '$lib/releases.yaml?raw';
  import type { Releases, HomeGroup } from '$lib/structure';

  import Footer from '$lib/components/Footer.svelte';

  const show = 4
  const releases = yaml.load(rel) as Releases;
  const all = Object.keys(releases).sort().reverse();
  const relGroup = [...new Set(all.map(r => r.split(".")[0]))].slice(0, show);

  let rs: HomeGroup = {};
  let archive: string[] = [];
  relGroup.map(x => rs[x] = {"top": [], "all": {}, "others": []})
  
  all.reverse().map(function(r) {
    let m1 = r.split(".")[0];
    let m2 = r.split(".")[1];
    if(relGroup.includes(m1)) {
      if(rs[m1]["all"][m2] == undefined) {
        rs[m1]["all"][m2] = []
      }
      rs[m1]["all"][m2].push(r)
    } else {
      archive.push(r);
    }
  });

  Object.keys(rs).map(function(x) {
    let tmp = rs[x]["all"];
    Object.keys(tmp).reverse().map(function(y) {
      rs[x]["top"].push(tmp[y][tmp[y].length - 1])
      if(tmp[y].length > 1) {
        tmp[y].pop();
      } else {
        delete tmp[y];
      }
    })

    rs[x]["others"] = Object.values(rs[x]["all"]).flat();
    rs[x]["all"] = {};
  })
</script>
  
<svelte:head>
	<title>Nokia SR Linux Yang Models</title>
</svelte:head>

<div class="flex flex-col items-center min-h-screen pt-5 has-header-img font-nunito">
  <div class="flex-grow-0 flex-shrink-0">
    <div class="w-screen text-right text-xs mr-10">
      <a class="px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full text-center inline-flex items-center" href="https://learn.srlinux.dev/yang/browser" target="_blank" rel="noreferrer">
        <svg class="w-3 h-3 mr-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 18">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 16.5c0-1-8-2.7-9-2V1.8c1-1 9 .707 9 1.706M10 16.5V3.506M10 16.5c0-1 8-2.7 9-2V1.8c-1-1-9 .707-9 1.706"/>
        </svg>
        Learn SR Linux
      </a>
      <a class="px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full text-center inline-flex items-center ml-1" href="https://github.com/nokia/srlinux-yang-models" target="_blank" rel="noreferrer">
        <svg class="w-3 h-3 mr-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z" clip-rule="evenodd"/>
        </svg>
        Yang models
      </a>
    </div>
  </div>
  <div class="flex-grow-1 flex-shrink-0 m-auto px-6 py-10">
    <div class="md:flex gap-x-20 items-center justify-between">
      <div class="flex">
        <div class="py-5 space-y-6">
          <p><img src="/images/nblue.png" width="80" alt="Logo" /></p>
          <h3 class="text-3xl text-nokia-old-blue font-light">SR Linux Yang Models</h3>
          {#each relGroup as major}
            <div class="flex items-center">
              <p class="mr-4 text-xl">{major}</p>
              <div class="flex items-center flex-wrap gap-2 text-sm">
                {#each rs[major].top as minor}
                  <a class="px-3 py-1.5 border border-gray-700 hover:bg-gray-700 hover:text-white rounded text-center w-20" href="{minor}">{minor.slice(1)}</a>
                {/each}
                {#if rs[major].others?.length }
                  <div class="dropdown">
                    <button class="dropdown-button px-3 py-1.5 border border-gray-700 hover:bg-gray-700 hover:text-white rounded text-center w-20 inline-flex items-center">
                      More
                      <svg class="w-2.5 h-2.5 ms-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                      </svg>
                    </button>
                    <div id="dropdownHover" class="dropdown-content absolute z-10 hidden bg-white rounded-lg shadow md:w-32 max-h-[160px] overflow-y-auto scroll-light dark:scroll-dark">
                      <ul class="py-2 text-gray-700">
                        {#each rs[major].others as entry}
                          <li><a href="{entry}" class="block px-4 py-2 hover:bg-gray-200">{entry.slice(1)}</a></li>
                        {/each}
                      </ul>
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
      <div class="flex">
        <div class="px-6 py-5 bg-white rounded shadow-xl space-y-4 max-w-[650px] text-sm">
          <p>
            <a class="text-blue-700 hover:underline" href="https://www.nokia.com/networks/products/service-router-linux-NOS" target="_blank" rel="noreferrer">Nokia SR Linux</a> 
            makes extensive use of structured data models. Each application regardless if it's being provided by Nokia or written by a user against the NDK has a 
            <a class="text-blue-700 hover:underline" href="https://datatracker.ietf.org/doc/html/rfc6020" target="_blank" rel="noreferrer">YANG</a> model that defines its configuration and state.
          </p>
          <p>With this design, the YANG data model is defined first, then the CLI, APIs, and show output formats are derived from it.</p>
          <p>A central role that is given to YANG in SR Linux Network OS demands a convenient interface to browse, search through and process these data models.</p>
          <ul class="list-disc list-outside space-y-1">
            <p>To answer these demands this portal provides:</p>
            <li class="ml-8">
              Fast <a class="text-blue-700 hover:underline" href="https://learn.srlinux.dev/yang/browser/#path-browser" target="_blank" rel="noreferrer">Path Browser</a> to
              effectively search through thousands of available YANG paths
            </li>
            <li class="ml-8">
              Beautiful <a class="text-blue-700 hover:underline" href="https://learn.srlinux.dev/yang/browser/#tree-browser" target="_blank" rel="noreferrer">Tree browser</a>
              to traverse the tree representation of the entire YANG data model of SR Linux
            </li>
            <li class="ml-8">
              Source <code class="text-xs">.yang</code> files neatly stored in a 
              <a class="text-blue-700 hover:underline" href="https://github.com/nokia/srlinux-yang-models" target="_blank" rel="noreferrer">nokia/srlinux-yang-models</a>
              repository for programmatic access and code generation
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div class="flex-grow-0 flex-shrink-0">
    <Footer home={true} />
  </div>
</div>