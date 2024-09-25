import { error } from "@sveltejs/kit";
import type { PlatformFeatures, Platforms, Releases } from "$lib/structure";
import type { FetchPostMessage } from "$lib/workers/structure";
import { extractFeatures } from "$lib/components/functions";

import yaml from 'js-yaml'
import rel from '$lib/releases.yaml?raw'
const releases = yaml.load(rel) as Releases

onmessage = async (event: MessageEvent<FetchPostMessage>) => {
  const { model, release, urlOrigin } = event.data;

  let features: Platforms = {}
  let platforms: PlatformFeatures = {}
  let uniqueFeatures: string[] = []

  if(model === "nokia" && releases[release]?.features) {
    const fetchUrl = `${urlOrigin}/releases/${release}/features.txt`
    
    const featResponse = await fetch(fetchUrl)
    if (featResponse.ok) {
      const featText = await featResponse.text()
      features = yaml.load(featText) as Platforms
      [platforms, uniqueFeatures] = extractFeatures(features);
    } else {
      throw error(404, "Error fetching platform features")
    }
  }

  postMessage({platforms, uniqueFeatures});
};

export {};