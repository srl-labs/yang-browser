import { error } from '@sveltejs/kit'

import type { PayLoad, Platforms, Releases } from '$lib/structure'

import yaml from 'js-yaml'
import rel from '$lib/releases.yaml?raw'
const allReleases = yaml.load(rel) as Releases

export async function load({ url, fetch, params, parent }) {
  const pathUrl = url.origin
  const release = params.release
  const validReleases = Object.keys(allReleases)

  if(validReleases.includes(release)) {
    let search = ""
    let modelTitle = "Nokia"
    let model = "nokia"

    if (url.searchParams.has("model")) {
      model = url.searchParams.get("model")!.trim()
    }

    if (url.searchParams.has("search")) {
      search = url.searchParams.get("search")!.trim();
    }
    
    if(model != "openconfig" && model != "nokia") {
      throw error(404, "Unsupported model")
    } else {
      let other = []
      if(model == "openconfig") {
        if(allReleases[release].openconfig) {
          modelTitle = "OpenConfig"
          other.push({name: "Nokia", path: `/${release}`})
        } else {
          throw error(404, "Unsupported model")
        }
      } else {
        if(allReleases[release].openconfig) {
          other.push({name: "OpenConfig", path: `/${release}/?model=openconfig`})
        }
      }

      let yangPaths: any[] = []
      let platFeats = {}

      async function fetchPageData(pathUrl: string, release: string, model: string) {
        try {
          const yangUrl = `${pathUrl}/releases/${release}/${model !== "nokia" ? model + "/" : ""}paths.json`;
          const response = await fetch(yangUrl);
          yangPaths = await response.json();
        } catch(e) {
          throw error(404, "Error fetching yang tree")
        }
      
        if(model === "nokia" && allReleases[release].features) {
          try {
            const response = await fetch(`${pathUrl}/releases/${release}/features.txt`);
            const responseText = await response.text();
            platFeats = yaml.load(responseText)
          } catch(e) {
            throw error(404, "Error fetching platform features")
          }
        }
      }

      await fetchPageData(pathUrl, release, model);

      return {
        model: model,
        modelTitle: modelTitle,
        release: release,
        other: other,
        search: decodeURIComponent(search),
        paths: yangPaths,
        features: platFeats
      }
    }
  } else {
    throw error(404, "Unsupported Release");
  }
}