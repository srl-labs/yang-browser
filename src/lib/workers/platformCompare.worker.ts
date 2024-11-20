import { error } from "@sveltejs/kit"

import { featureBasedFilter } from "$lib/components/functions"
import type { PathDef } from "$lib/structure"
import type { PlatformComparePostMessage, DiffResponseMessage } from "$lib/workers/structure"

onmessage = async (event: MessageEvent<PlatformComparePostMessage>) => {
  const { release, x, y, xFeatures, yFeatures } = event.data

  let paths: PathDef[] = []

  async function fetchPaths(release: string) {
    const versionUrl = `/releases/${release}/paths.json`
    const pathResponse = await fetch(versionUrl)

    if (pathResponse.ok) {
      const pathJson = await pathResponse.json()
      const addDefaults = pathJson.map((k: PathDef) => ({...k, release: release.substring(1), compareTo: y, "is-state": ("is-state" in k ? "R" : "RW")}))
      paths = addDefaults
    } else {
      throw error(404, `Error fetching ${release} yang tree`)
    }
  }

  await fetchPaths(release)

  // Start of Compare operation
  const getPathObj = (list: PathDef[], path: string) => list.filter((k :PathDef) => k.path === path)

  const xpaths = xFeatures?.length ? paths.filter(x => featureBasedFilter(x, xFeatures)) : paths
  const ypaths = yFeatures?.length ? paths.filter(x => featureBasedFilter(x, yFeatures)) : paths

  const xOnlyPath = xpaths.map((k :PathDef) => k.path)
  const yOnlyPath = ypaths.map((k :PathDef) => k.path)

  const setX = new Set(xOnlyPath)
  const setY = new Set(yOnlyPath)

  const typeChange: DiffResponseMessage[] = []
  const removedFromX: DiffResponseMessage[] = []
  const newInY: DiffResponseMessage[] = []

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

  postMessage(diff)
}

export {}