import { error } from '@sveltejs/kit'

import yaml from 'js-yaml'
import rel from '$lib/releases.yaml?raw'
import type { Releases } from '$lib/structure'

const releases = yaml.load(rel) as Releases
const validVersions = [...new Set(Object.keys(releases))]

export async function load({ url, params }) {
  const release = params.release

  if(!validVersions.includes(release)) {
    throw error(404, "Unsupported release")
  }

  const model = url.searchParams.get("model")?.trim() ?? "nokia"
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

  const urlPath = url.searchParams.get("path")?.trim() ?? ""
  const platform = url.searchParams.get("platform")?.trim() ?? ""

  return {
    model: model, 
    release: release, 
    platform: platform, 
    allModels: allModels, 
    modelTitle: modelTitle,
    urlPath: decodeURIComponent(urlPath)
  }
}