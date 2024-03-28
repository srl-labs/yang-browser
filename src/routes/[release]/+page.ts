import { error } from '@sveltejs/kit'

import type { Releases } from '$lib/structure'

import yaml from 'js-yaml'
import rel from '$lib/releases.yaml?raw'
const allReleases = yaml.load(rel) as Releases

export async function load({ url, fetch, params }) {
  const pathUrl = url.origin
  const release = params.release
  const validReleases = Object.keys(allReleases)

  if(validReleases.includes(release)) {
    let modelTitle = "Nokia"
    let model = "nokia"

    if (url.searchParams.has("model")) {
      model = url.searchParams.get("model").trim()
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

      try {
        let fetchUrl = `${pathUrl}/releases/${release}/paths.json`
        if (model !== "nokia") {
          fetchUrl = `${pathUrl}/releases/${release}/${model}/paths.json`
        }
        const resp = await fetch(fetchUrl);
        const yangPaths = await resp.json();

        if(model === "nokia" && allReleases[release].features) {
          const featureUrl = `${pathUrl}/releases/${release}/features.txt`;
          const featureResp = await fetch(featureUrl);
          const featureRaw = await featureResp.text();
          return {
            model: model,
            modelTitle: modelTitle,
            release: release,
            other: other,
            paths: await yangPaths,
            features: await yaml.load(featureRaw)
          }
        }
        return {
          model: model,
          modelTitle: modelTitle,
          release: release,
          other: other,
          paths: await yangPaths,
          features: {}
        }
      } catch(e) {
        throw error(404, "Error fetching yang tree");
      }
    }
  } else {
    throw error(404, "Unsupported Release");
  }
}