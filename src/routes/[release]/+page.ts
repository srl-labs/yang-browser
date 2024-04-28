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

      let payload = {
        model: model,
        modelTitle: modelTitle,
        release: release,
        other: other,
        search: decodeURIComponent(search),
        paths: [],
        features: {}
      }

      let yangPathUrl = `${pathUrl}/releases/${release}/${model !== "nokia" ? model + "/" : ""}paths.json`;
      let yangPaths = fetch(yangPathUrl).then(response => response.json())
      .catch(error => {throw error(404, "Error fetching yang tree")})
      
      payload["paths"] = await yangPaths

      if(model === "nokia" && allReleases[release].features) {
        let features: Platforms = {}
        
        let platforms = await fetch(`${pathUrl}/releases/${release}/features.txt`)
        .then(response => response.text())
        .catch(error => {throw error(404, "Error fetching platform features")});

        /*const response = await fetch(`${pathUrl}/releases/${release}/features.txt`);
        const respText: string | undefined = await response.text();
        if (response.ok || respText != "") {
          features = yaml.load(respText);
        } else {
          throw new Error("Error fetching platform features");
        }*/

        console.log(platforms)
        payload["features"] = yaml.load(platforms);
      }
      
      return payload
    }
  } else {
    throw error(404, "Unsupported Release");
  }
}