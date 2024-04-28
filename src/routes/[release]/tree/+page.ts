import { error } from '@sveltejs/kit';

import yaml from 'js-yaml';
import rel from '$lib/releases.yaml?raw';
const allReleases = yaml.load(rel) as Releases;

import type { Releases } from '$lib/structure';

/** @type {import('./$types').PageLoad} */
export async function load({ url, fetch, params }) {
  let path = "";
  const pathUrl = url.origin;
  const release = params.release;
  const validReleases = Object.keys(allReleases);

  if(validReleases.includes(release)) {
    let urlPath = "";
    let modelTitle = "Nokia"
    let model = "nokia"

    if (url.searchParams.has("path")) {
      urlPath = url.searchParams.get("path")!.trim();
    }

    if (url.searchParams.has("model")) {
      model = url.searchParams.get("model")!.trim()
    }
    
    if(model != "openconfig" && model != "nokia") {
      throw error(404, "Unsupported model")
    } else {
      let other = []
      if(model == "openconfig") {
        if(allReleases[release].openconfig) {
          modelTitle = "OpenConfig"
          other.push({name: "Nokia", path: `/${release}/tree`})
        } else {
          throw error(404, "Unsupported model")
        }
      } else {
        if(allReleases[release].openconfig) {
          other.push({name: "OpenConfig", path: `/${release}/tree?model=openconfig`})
        }
      }

      let payload = {
        urlPath: urlPath,
        model: model,
        modelTitle: modelTitle,
        release: release,
        other: other,
        paths: []
      }

      let yangPathUrl = `${pathUrl}/releases/${release}/${model !== "nokia" ? model + "/" : ""}paths.json`;
      let yangPaths = fetch(yangPathUrl).then(response => response.json())
      .catch(error => {throw error(404, "Error fetching yang tree")})
      
      payload["paths"] = await yangPaths
      return payload
    }
  } else {
    throw error(404, "Unsupported Release");
  }
}