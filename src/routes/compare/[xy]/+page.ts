import { error } from '@sveltejs/kit'

import yaml from 'js-yaml'
import rel from '$lib/releases.yaml?raw'
import type { Releases } from '$lib/structure'
const releases = yaml.load(rel) as Releases
const validVersions = [...new Set(Object.keys(releases))]

export async function load({ url, params }) {
  const xy = params.xy

  const sep = xy.split("..")
  if(sep.length !== 2) {
    throw error(404, "Unsupported X..Y compare parameter")
  }

  const x = url.searchParams.get("x")?.trim() ?? sep[0];
  const y = url.searchParams.get("x")?.trim() ?? sep[1];
  const model = url.searchParams.get("model")?.trim() ?? "nokia";
  const urlPath = url.searchParams.get("path")?.trim() ?? "";

  if(!validVersions.includes(`v${x}`)) {
    throw error(404, "Unsupported X release")
  }
  if(!validVersions.includes(`v${y}`)) {
    throw error(404, "Unsupported Y release")
  }
  if(x === y) {
    throw error(404, "X & Y releases cannot be the same")
  }
  if(model !== "openconfig" && model !== "nokia") {
    throw error(404, "Unsupported model")
  }
  
  if(model === "openconfig" && !releases[`v${x}`].openconfig) {
    throw error(404, "OpenConfig not supported for X release")
  }
  if(model === "openconfig" && !releases[`v${y}`].openconfig) {
    throw error(404, "OpenConfig not supported for Y release")
  }

  return {
    x: x, 
    y: y, 
    model: model, 
    urlPath: urlPath,
  }
}