import { error } from '@sveltejs/kit';

import type { Releases } from '$lib/structure';

import yaml from 'js-yaml';
import rel from '$lib/releases.yaml?raw';
const allReleases = yaml.load(rel) as Releases;

/** @type {import('./$types').PageLoad} */
export async function load({ url, fetch, params }) {
  const pathUrl = url.origin;
  const release = params.release;
  const validReleases = Object.keys(allReleases);

  if(validReleases.includes(release)) {
    try {
      const fetchUrl = `${pathUrl}/releases/${release}/paths.json`;
      const resp = await fetch(fetchUrl);
      const yangPaths = await resp.json();

      if(allReleases[release].features) {
        const featureUrl = `${pathUrl}/releases/${release}/features.txt`;
        const featureResp = await fetch(featureUrl);
        const featureRaw = await featureResp.text();
        return {
          release: release,
          paths: await yangPaths,
          features: await yaml.load(featureRaw)
        }
      }
      else {
        return {
          release: release,
          paths: await yangPaths
        }
      }
    } catch(e) {
      throw error(404, "Error fetching yang tree");
    }
  } else {
    throw error(404, "Unsupported Release");
  }
}