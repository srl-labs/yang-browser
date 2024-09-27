import { error } from "@sveltejs/kit"

import type { PathDef, Releases } from "$lib/structure"
import type { YangTreePostMessage } from "$lib/workers/structure"
import { featureBasedFilter, removeKeyDefault, searchBasedFilter } from "$lib/components/functions"

onmessage = async (event: MessageEvent<YangTreePostMessage>) => {
  const { model, release, urlOrigin, searchInput, stateInput, featSelect } = event.data

  let paths: PathDef[] = []

  const versionUrl = `${urlOrigin}/releases/${release}/${model !== "nokia" ? model + "/" : ""}paths.json`
  const pathResponse = await fetch(versionUrl)

  if (pathResponse.ok) {
    const pathJson = await pathResponse.json()
    paths = pathJson.map((k: any) => ({...k, "is-state": ("is-state" in k ? "R" : "RW")}))
  } else {
    throw error(404, `Error fetching ${release} yang tree`)
  }

  let stateFilter = paths.filter((x: any) => stateInput == "" ? true : x["is-state"] == stateInput)
  let searchFilter = stateFilter.filter((x: any) => searchBasedFilter(x, searchInput))
  let featFilter = featSelect?.length ? searchFilter.filter((x: any) => featureBasedFilter(x, featSelect)) : searchFilter

  // Tree Builder
  class TreeNode {
    name: string
    children: any[]
	  details: any | PathDef
    type: string
    constructor(name: string, isKey: boolean, details: any | PathDef, type: string) {
      isKey ? this.name = name + "*" : this.name = name
      this.children = []
      this.details = details
      this.type = type
    }
  }

  const node = new TreeNode(release, false, {}, "folder")
  const extractBetween = (str: string) => {
    const regex = /\[(.*?)\]/g
    const matches = []
    let match
    while ((match = regex.exec(str)) !== null) {
      matches.push(match[1])
    }
    return matches
  }

  let keys: string[] = []
  for (const entry of featFilter) {
    let currentNode = node

    let xpath = entry["path"]
    let clean = removeKeyDefault(xpath)
    let segments = clean.split("/").slice(1)
    let segLen = segments.length

    let containerPath = []

    segments.forEach((segment: string, i: number) => {
      containerPath.push(segment)
      if(segment.includes("[")) keys = extractBetween(segment)
      let childNode = currentNode.children.find((node: { name: string }) => node.name === segment)

      if (!childNode) {
        let isKey = false
        let isLast = (i == (segLen - 1))

        let paramPath = (isLast ? entry : {"path" : "/" + containerPath.join("/")})
        if(keys.length > 0 && keys.includes(segment)) isKey = true
        let nodeType = (isLast ? "file" : "folder")

        childNode = new TreeNode(segment, isKey, paramPath, nodeType)
        if(isKey) {
          currentNode.children = [childNode].concat(currentNode.children)
        }
        else currentNode.children.push(childNode)

        if(isLast) containerPath.pop()
      }

      currentNode = childNode
    })
  }

  postMessage(node)
}

export {}