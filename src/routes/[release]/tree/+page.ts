import { error } from '@sveltejs/kit';

import yaml from 'js-yaml'
import rel from '$lib/releases.yaml?raw'
import type { PathDef, Releases, TreePayLoad } from '$lib/structure'
const releases = yaml.load(rel) as Releases
const validVersions = [...new Set(Object.keys(releases))]

export async function load({ url, fetch, params }) {
  const release = params.release;

  if(!validVersions.includes(release)) {
    throw error(404, "Unsupported release")
  }

  const model = url.searchParams.get("model")?.trim() ?? "nokia";
  if(model != "openconfig" && model != "nokia") {
    throw error(404, "Unsupported model")
  }

  let allModels = [{title: "Nokia", path: `/${release}`}]
  if(releases[release].openconfig) {
    allModels.push({title: "OpenConfig", path: `/${release}/?model=openconfig`})
  }

  let modelTitle = "Nokia"
  if(model === "openconfig") {
    if(releases[release].openconfig) {
      modelTitle = "OpenConfig"
    } else {
      throw error(404, "Unsupported model")
    }
  }

  const urlPath = url.searchParams.get("path")?.trim() ?? "";
  const crossLaunched = url.searchParams.get("from")?.trim() === "pb" ? true : false ?? "";

  let payload: TreePayLoad = {
    urlPath: decodeURIComponent(urlPath),
    crossLaunched: crossLaunched, 
    model: model,
    modelTitle: modelTitle,
    release: release,
    allModels: allModels,
    paths: []
  }

  let yangPathUrl = `${url.origin}/releases/${release}/${model !== "nokia" ? model + "/" : ""}paths.json`;
  let yangPaths = fetch(yangPathUrl).then(response => response.json())
  .then((response: PathDef[]) => response.map((k: any) => ({...k, "is-state": ("is-state" in k ? "true" : "false")})))
  .catch(error => {throw error(404, "Error fetching yang tree")})
  
  payload.paths = await yangPaths
  return payload
}