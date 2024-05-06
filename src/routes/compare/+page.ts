import { error } from '@sveltejs/kit'

import yaml from 'js-yaml'
import rel from '$lib/releases.yaml?raw'
import type { PathDef, Releases } from '$lib/structure'
const releases = yaml.load(rel) as Releases
const validVersions = [...new Set(Object.keys(releases))]

export async function load({ url, fetch }) {
  let x: string = ""
  let y: string = ""
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
  
  if(model === "openconfig" && !releases[x].openconfig) {
    throw error(404, "OpenConfig not supported for X release")
  }
  if(model === "openconfig" && !releases[y].openconfig) {
    throw error(404, "OpenConfig not supported for Y release")
  }

  async function fetchPaths(version: string) {
    const versionUrl = `${url.origin}/releases/v${version}/${model !== "nokia" ? model + "/" : ""}paths.json`
    return fetch(versionUrl)
    .then(response => response.json())
    .then(response => response.map((k: any) => ({...k, release: version, compareTo: y, "is-state": ("is-state" in k ? "true" : "false")})))
    .catch(error => { throw error(404, `Error fetching ${version} yang tree`) })
  }

  async function pathDiff(x: PathDef[], y: PathDef[]) {
    const typeChange = []
    const removedFromX = []
    const newInY = []

    for (const itemX of x) {
      const yFilter = y.filter((itemY: PathDef) => itemX.path === itemY.path)
      if(yFilter.length === 0) {
        removedFromX.push({...itemX, compare: "DEL"})
      }
      else if(yFilter.length === 1) {
        if(itemX.type !== yFilter[0].type) {
          typeChange.push({...yFilter[0], fromType: itemX.type, fromRel: itemX.release, compare: "MOD"})
        }
      }
    }

    for (const itemY of y) {
      const xFilter = x.filter((itemX: PathDef) => itemX.path === itemY.path)
      if(xFilter.length === 0) {
        newInY.push({...itemY, compare: "ADD"})
      }
    }

    return { typeChange, newInY, removedFromX }
  }

  const xpaths = await fetchPaths(x)
  const ypaths = await fetchPaths(y)

  const {typeChange, newInY, removedFromX} = await pathDiff(xpaths, ypaths)

  return {
    urlPath: urlPath,
    x: x, y: y, model: model,
    typeChange: typeChange, 
    newInY: newInY, 
    removedFromX: removedFromX
  }
}