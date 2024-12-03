import { error } from '@sveltejs/kit'

import yaml from 'js-yaml'
import rel from '$lib/releases.yaml?raw'
import type { Platforms, Releases } from '$lib/structure'

const releases = yaml.load(rel) as Releases
const validVersions = [...new Set(Object.keys(releases))]

export async function load({ url, params, fetch }) {
  const release = params.release
  if(!validVersions.includes(release)) {
    throw error(404, "Unsupported release")
  }

  const model = url.searchParams.get("model")?.trim() ?? "nokia"
  if(model != "nokia") {
    throw error(404, "Unsupported model")
  }

  const xy = params.xy
  const sep = xy.split("..")
  if(sep.length !== 2) {
    throw error(404, "Unsupported X..Y compare parameter")
  }
  const x = sep[0]
  const y = sep[1]

  let features: Platforms = {}
  let validPlatforms: string[] = []

  if(releases[release]?.features) {
    const fetchUrl = `${url.origin}/releases/${release}/features.txt`
    
    const featResponse = await fetch(fetchUrl)
    if (featResponse.ok) {
      const featText = await featResponse.text()
      features = yaml.load(featText) as Platforms
      if (Object.keys(features)?.length) {
        validPlatforms = Object.keys(features)
      } else {
        throw error(404, "Platforms are not supported in this release")
      }
    } else {
      throw error(404, "Error fetching platform features")
    }
  }

  if(!validPlatforms.includes(x)) {
    throw error(404, `Unsupported X (${x}) platform`)
  }
  if(!validPlatforms.includes(y)) {
    throw error(404, `Unsupported Y (${y}) platform`)
  }
  if(x === y) {
    throw error(404, "X & Y platforms cannot be the same")
  }

  const urlPath = url.searchParams.get("path")?.trim() ?? ""

  return {
    x: x, 
    y: y, 
    model: model,
    release: release, 
    urlPath: urlPath, 
    xFeatures: features[x].split(/\s+/),
    yFeatures: features[y].split(/\s+/),
  }
}