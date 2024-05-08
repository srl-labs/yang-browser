import { error } from '@sveltejs/kit'

import yaml from 'js-yaml'
import rel from '$lib/releases.yaml?raw'
import type { PathDef, Releases } from '$lib/structure'
const releases = yaml.load(rel) as Releases
const validVersions = [...new Set(Object.keys(releases))]

export async function load({ url, params, fetch }) {
  const xy = params.xy

  const sep = xy.split("..")
  if(sep.length !== 2) {
    throw error(404, "Unsupported X..Y compare parameter")
  }

  let x: string = sep[0]
  let y: string = sep[1]
  let urlPath: string = ""
  let model: string = "nokia"

  if(url.searchParams.has("x")) {
    x = url.searchParams.get("x")!.trim()
  }
  if(url.searchParams.has("y")) {
    y = url.searchParams.get("y")!.trim()
  }
  if(url.searchParams.has("model")) {
    model = url.searchParams.get("model")!.trim()
  }
  if (url.searchParams.has("path")) {
    urlPath = url.searchParams.get("path")!.trim();
  }

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

  async function fetchPaths(version: string) {
    const versionUrl = `${url.origin}/releases/v${version}/${model !== "nokia" ? model + "/" : ""}paths.json`
    return fetch(versionUrl)
    .then((response: { json: () => any }) => response.json())
    .then((response: PathDef[]) => response.map((k: any) => ({...k, release: version, compareTo: y, "is-state": ("is-state" in k ? "true" : "false")})))
    .catch((error: (arg0: number, arg1: string) => any) => { throw error(404, `Error fetching ${version} yang tree`) })
  }

  async function getFeatures() {
    if(model === "nokia" && releases[`v${y}`].features) {
      return fetch(`${url.origin}/releases/v${y}/features.txt`)
      .then(response => response.text())
      .then(response => yaml.load(response))
      .catch(error => {throw error(404, "Error fetching platform features")});
    }
    return {}
  }
  
  const xpaths = await fetchPaths(x)
  const ypaths = await fetchPaths(y)
  const yfeatures = await getFeatures()

  return {
    urlPath: urlPath,
    x: x, y: y, model: model,
    xpaths: xpaths, 
    ypaths: ypaths,
    yfeatures: yfeatures
  }
}