import { error } from "@sveltejs/kit"

import { extractFeatures } from "$lib/components/functions"
import type { PathDef, Platforms, PlatformFeatures, Releases } from "$lib/structure"
import type { ComparePostMessage, DiffResponseMessage } from "$lib/workers/structure"

import yaml from 'js-yaml'
import rel from '$lib/releases.yaml?raw'
const releases = yaml.load(rel) as Releases

onmessage = async (event: MessageEvent<ComparePostMessage>) => {
  const { x, y, model, urlOrigin } = event.data

  let xpaths: PathDef[] = []
  let ypaths: PathDef[] = []
  let yfeatures: Platforms = {}
  let platformFeatures: PlatformFeatures = {}
  let uniqueFeatures: string[] = []

  async function fetchPaths(release: string) {
    const versionUrl = `${urlOrigin}/releases/v${release}/${model !== "nokia" ? model + "/" : ""}paths.json`
    const pathResponse = await fetch(versionUrl)

    if (pathResponse.ok) {
      const pathJson = await pathResponse.json()
      const addDefaults = pathJson.map((k: any) => ({...k, release: release, compareTo: y, "is-state": ("is-state" in k ? "R" : "RW")}))
      if(release === x) {
        xpaths = addDefaults
      } else if(release === y) {
        ypaths = addDefaults
      }
    } else {
      throw error(404, `Error fetching ${release} yang tree`)
    }
  }

  await fetchPaths(x)
  await fetchPaths(y)

  if(model === "nokia" && releases[`v${y}`]?.features) {
    const fetchUrl = `${urlOrigin}/releases/v${y}/features.txt`
    
    const featResponse = await fetch(fetchUrl)
    if (featResponse.ok) {
      const featText = await featResponse.text()
      yfeatures = yaml.load(featText) as Platforms
      [platformFeatures, uniqueFeatures] = extractFeatures(yfeatures)
    } else {
      throw error(404, "Error fetching platform features")
    }
  }

  // Start of Compare operation
  const xOnlyPath = xpaths.map((k :PathDef) => k.path)
  const yOnlyPath = ypaths.map((k :PathDef) => k.path)

  const getPathObj = (list: PathDef[], path: string) => list.filter((k :PathDef) => k.path === path)

  const typeChange: DiffResponseMessage[] = []
  const removedFromX: DiffResponseMessage[] = []
  const newInY: DiffResponseMessage[] = []

  const setX = new Set(xOnlyPath)
  const setY = new Set(yOnlyPath)

  for (const item of setX) {
    if (setY.has(item)) {
      const xObj = getPathObj(xpaths, item)[0]
      const yObj = getPathObj(ypaths, item)[0]
      if(xObj.type !== yObj.type) {
        typeChange.push({...yObj, fromType: xObj.type, fromRel: xObj.release, compare: "~"})
      }
    } else {
      const xObj = getPathObj(xpaths, item)[0]
      removedFromX.push({...xObj, compare: "-"})
    }
  }

  for (const item of setY) {
    if (!setX.has(item)) {
      const yObj = getPathObj(ypaths, item)[0]
      newInY.push({...yObj, compare: "+"})
    }
  }

  const diff = [...newInY, ...removedFromX, ...typeChange].sort((a, b) => {
    const keyA = a["path"]
    const keyB = b["path"]
    if (keyA < keyB) return -1
    if (keyA > keyB) return 1
    return 0
  })

  postMessage({diff, platformFeatures, uniqueFeatures})
}

export {}