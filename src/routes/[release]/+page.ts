import { error } from '@sveltejs/kit'

import yaml from 'js-yaml'
import rel from '$lib/releases.yaml?raw'
import type { PathDef, PayLoad, Platforms, Releases } from '$lib/structure'
const releases = yaml.load(rel) as Releases
const validVersions = [...new Set(Object.keys(releases))]

export async function load({ url, fetch, params }) {
  const release = params.release

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
  let payload: PayLoad = {
    model: model, modelTitle: modelTitle,
    urlPath: decodeURIComponent(urlPath),
    release: release, allModels: allModels,
    paths: [], features: {}
  }

  async function fetchPaths(version: string) {
    const versionUrl = `${url.origin}/releases/${version}/${model !== "nokia" ? model + "/" : ""}paths.json`
    return fetch(versionUrl)
    .then((response: { json: () => any }) => response.json())
    .then((response: PathDef[]) => response.map((k: any) => ({...k, "is-state": ("is-state" in k ? "true" : "false")})))
    .catch((error: (arg0: number, arg1: string) => any) => { throw error(404, `Error fetching ${version} yang tree`) })
  }

  payload.paths = await fetchPaths(release)
  
  if(model === "nokia" && releases[release].features) {
    const fetchUrl = `${url.origin}/releases/${release}/features.txt`
    const platFeats = fetch(fetchUrl)
    .then(response => response.text())
    .then(response => yaml.load(response) as Platforms)
    .catch(error => {throw error(404, "Error fetching platform features")});

    payload.features = await platFeats
  }
  
  return payload
}