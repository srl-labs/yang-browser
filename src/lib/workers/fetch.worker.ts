
import { error } from "@sveltejs/kit"

import { extractFeatures } from "$lib/components/functions"
import type { FetchPostMessage } from "$lib/workers/structure"
import type { PathDef, Platforms, PlatformFeatures, Releases } from "$lib/structure"

import yaml from 'js-yaml'
import rel from '$lib/releases.yaml?raw'
const releases = yaml.load(rel) as Releases

onmessage = async (event: MessageEvent<FetchPostMessage>) => {
  const { model, release } = event.data

  let paths: PathDef[] = []
  let features: Platforms = {}
  let platformFeatures: PlatformFeatures = {}
  let uniqueFeatures: string[] = []

  const versionUrl = `/releases/${release}/${model !== "nokia" ? model + "/" : ""}paths.json`
  const pathResponse = await fetch(versionUrl)

  if (pathResponse.ok) {
    const pathJson = await pathResponse.json()
    paths = pathJson.map((k: PathDef) => ({...k, "is-state": ("is-state" in k ? "R" : "RW")}))
  } else {
    throw error(404, `Error fetching ${release} yang tree`)
  }
  
  if(model === "nokia" && releases[release]?.features) {
    const fetchUrl = `/releases/${release}/features.txt`
    
    const featResponse = await fetch(fetchUrl)
    if (featResponse.ok) {
      const featText = await featResponse.text()
      features = yaml.load(featText) as Platforms
      [platformFeatures, uniqueFeatures] = extractFeatures(features)
    } else {
      throw error(404, "Error fetching platform features")
    }
  }

  postMessage({paths, platformFeatures, uniqueFeatures})
}

export {}