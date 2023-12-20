<script lang="ts">
  import yaml from 'js-yaml';
  import rel from '$lib/releases.yaml?raw';
  import type { Releases, HomeGroup } from '$lib/structure';

  import Footer from '$lib/components/Footer.svelte';

  const releases = yaml.load(rel) as Releases;
  const all = Object.keys(releases).sort().reverse();
  const top4 = [...new Set(all.map(r => r.split(".")[0]))].slice(0, 2);

  let rs: HomeGroup = {};
  let archive: string[] = [];
  top4.map(x => rs[x] = {"top3": [], "all": {}, "others": []})
  
  all.reverse().map(function(r) {
    let m1 = r.split(".")[0];
    let m2 = r.split(".")[1];
    if(top4.includes(m1)) {
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
      rs[x]["top3"].push(tmp[y][tmp[y].length - 1])
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

<div class="flex flex-col items-center min-h-screen pt-5 has-header-img font-nokia-headline-light">
  <div class="flex-grow-0 flex-shrink-0">
    <div class="text-sm">
      <a class="px-3 py-1.5 bg-blue-500 text-white rounded-full text-center inline-block items-center" href="https://learn.srlinux.dev/yang/browser" target="_blank" rel="noreferrer">
        <span class="icon"><i class="fab fa-leanpub"></i></span>
        <span>Learn SR Linux</span>
      </a>
      <a class="px-3 py-1.5 bg-blue-500 text-white rounded-full text-center inline-block items-center ml-1" href="https://github.com/nokia/srlinux-yang-models" target="_blank" rel="noreferrer">
        <span class="icon"><i class="fab fa-github"></i></span>
        <span>Yang models</span>
      </a>
    </div>
  </div>
  <div class="flex-grow-1 flex-shrink-0 m-auto px-10">
    <div class="md:flex gap-x-20 items-center justify-between">
      <div class="flex">
        <div class="py-5 space-y-6">
          <p><img src="/images/nokia_b.png" width="90" alt="Logo" /></p>
          <h3 class="text-3xl font-light text-nokia-old-blue">SR Linux Yang Models</h3>
          {#each top4 as major}
            <div class="flex items-center">
              <p class="mr-4 text-xl">{major}</p>
              <div class="flex flex-wrap gap-2">
                {#each rs[major].top3 as minor}
                  <a class="px-3 py-1.5 border border-black rounded text-center w-20" href="{minor}">{minor.slice(1)}</a>
                {/each}
                <div class="dropdown">
                  <button class="dropdown-button px-3 py-1.5 border border-black rounded text-center w-20 inline-flex items-center">
                    More
                    <svg class="w-2.5 h-2.5 ms-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
                    </svg>
                  </button>
                  <div id="dropdownHover" class="dropdown-content absolute z-10 hidden bg-white rounded-lg shadow md:w-32 max-h-[150px] overflow-y-auto">
                    <ul class="py-2 text-sm text-gray-700">
                      {#each rs[major].others as entry}
                        <li><a href="{entry}" class="block px-4 py-2 hover:bg-gray-100">{entry.slice(1)}</a></li>
                      {/each}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
      <div class="flex">
        <div class="px-6 py-5 bg-white rounded shadow-xl space-y-4 max-w-[650px]">
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
              Source <code class="text-sm">.yang</code> files neatly stored in a 
              <a class="text-blue-700 hover:underline" href="https://github.com/nokia/srlinux-yang-models" target="_blank" rel="noreferrer">nokia/srlinux-yang-models</a>
              repository for programmatic access and code generation
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div class="flex-grow-0 flex-shrink-0">
    <Footer home={false} />
  </div>
</div>