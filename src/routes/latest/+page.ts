import { redirect } from '@sveltejs/kit'

import yaml from 'js-yaml'
import rel from '$lib/releases.yaml?raw'
import type { Releases } from '$lib/structure'

const releases = yaml.load(rel) as Releases
const validVersions = [...new Set(Object.keys(releases))]

export async function load() {
  const latest = validVersions[0]
  throw redirect(307, `/${latest}`);
}