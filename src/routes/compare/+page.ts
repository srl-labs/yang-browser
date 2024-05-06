import { error } from '@sveltejs/kit'

import yaml from 'js-yaml'
import rel from '$lib/releases.yaml?raw'
import type { Releases } from '$lib/structure'
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
    //.then(response => response.map((k: any) => [("is-state" in k ? "true" : "false"), k.path, k.type]))
    //.then(response => response.map((k: any) => `${"is-state" in k ? "true" : "false"};${k.path};${k.type}`))
    .catch(error => { throw error(404, `Error fetching ${version} yang tree`) })
  }

  async function pathDiff(x: string[], y: string[]) {
    const commonXY = []
    const newInY = []
    const removedFromX = []

    const setX = new Set(x)
    const setY = new Set(y)

    for (const item of setX) {
      if (setY.has(item)) {
        commonXY.push(item)
      } else {
        removedFromX.push(item)
      }
    }

    for (const item of setY) {
      if (!setX.has(item)) {
        newInY.push(item)
      }
    }

    return { commonXY, newInY, removedFromX }
  }

  const xpaths = await fetchPaths(x)
  const ypaths = await fetchPaths(y)

  const xOnlyPath = xpaths.map((k :any) => k.path)
  const yOnlyPath = ypaths.map((k :any) => k.path)

  const {commonXY, newInY, removedFromX} = await pathDiff(xOnlyPath, yOnlyPath)
  
  const diffNoChange = ypaths.filter((k: any) => commonXY.includes(k.path)).map((k: any) => ({...k, compare: "=", release: y, "is-state": ("is-state" in k ? "true" : "false")}))
  const diffNewY = ypaths.filter((k: any) => newInY.includes(k.path)).map((k: any) => ({...k, compare: "+", release: y, "is-state": ("is-state" in k ? "true" : "false")}))
  const diffRemovedX = xpaths.filter((k: any) => removedFromX.includes(k.path)).map((k: any) => ({...k, compare: "-", release: x, "is-state": ("is-state" in k ? "true" : "false")}))

  return {
    urlPath: urlPath,
    x: x, y: y, model: model,
    commonXY: diffNoChange, 
    newInY: diffNewY, 
    removedFromX: diffRemovedX
  }
}