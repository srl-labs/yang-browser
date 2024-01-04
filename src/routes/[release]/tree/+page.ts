import { error } from '@sveltejs/kit';

import yaml from 'js-yaml';
import rel from '$lib/releases.yaml?raw';
const allReleases = yaml.load(rel) as Releases;

import type { Releases } from '$lib/structure';

/** @type {import('./$types').PageLoad} */
export async function load({ url, fetch, params }) {
  let path = "";
  const pathUrl = url.origin;
  const release = params.release;
  const validReleases = Object.keys(allReleases);

  if(validReleases.includes(release)) {
    if (url.searchParams.has("path")) {
      path = url.searchParams.get("path").trim();
    }
    try {
      const fetchUrl = `${pathUrl}/releases/${release}/paths.json`;
      const resp = await fetch(fetchUrl);
      const yangPaths = await resp.json();

      return {
        path: path,
        release: release,
        paths: await yangPaths
      }
    } catch(e) {
      throw error(404, "Error fetching yang tree");
    }
  } else {
    throw error(404, "Unsupported Release");
  }
}