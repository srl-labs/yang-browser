import yaml from 'js-yaml'
import { error } from "@sveltejs/kit";
import { extractFeatures } from "$lib/components/functions";

import type { PathDef, Platforms, PlatformFeatures, Releases } from "$lib/structure";
import type { FetchPostMessage } from "$lib/workers/structure";

import rel from '$lib/releases.yaml?raw'
const releases = yaml.load(rel) as Releases

onmessage = async (event: MessageEvent<FetchPostMessage>) => {
  const { model, release, urlOrigin } = event.data;

  let paths: PathDef[] = []
  let features: Platforms = {}
  let platformFeatures: PlatformFeatures = {}
  let uniqueFeatures: string[] = []

  const versionUrl = `${urlOrigin}/releases/${release}/${model !== "nokia" ? model + "/" : ""}paths.json`
  const pathResponse = await fetch(versionUrl)

  if (pathResponse.ok) {
    const pathJson = await pathResponse.json()
    paths = pathJson.map((k: any) => ({...k, "is-state": ("is-state" in k ? "R" : "RW")}))
  } else {
    throw error(404, `Error fetching ${release} yang tree`)
  }
  
  if(model === "nokia" && releases[release]?.features) {
    const fetchUrl = `${urlOrigin}/releases/${release}/features.txt`
    
    const featResponse = await fetch(fetchUrl)
    if (featResponse.ok) {
      const featText = await featResponse.text()
      features = yaml.load(featText) as Platforms
      [platformFeatures, uniqueFeatures] = extractFeatures(features);
    } else {
      throw error(404, "Error fetching platform features")
    }
  }

  postMessage({paths, platformFeatures, uniqueFeatures});
};

export {};