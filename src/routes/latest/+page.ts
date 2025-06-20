import { redirect } from '@sveltejs/kit'

import yaml from 'js-yaml'
import rel from '$lib/releases.yaml?raw'
import type { Releases } from '$lib/structure'

const releases = yaml.load(rel) as Releases
const validVersions = [...new Set(Object.keys(releases))]

export async function load({ url }) {
  const latest = validVersions[0]
  const params = url.search
  throw redirect(307, `/${latest}${params}`);
}