import { error } from "@sveltejs/kit"

import type { PathDef } from "$lib/structure"
import type { YangTreeContainer, YangTreePostMessage, YangTreeResponseMessage } from "$lib/workers/structure"
import { featureBasedFilter, removeKeyDefault, searchBasedFilter } from "$lib/components/functions"

onmessage = async (event: MessageEvent<YangTreePostMessage>) => {
  const { model, release, searchInput, stateInput, featSelect } = event.data

  let paths: PathDef[] = []

  const versionUrl = `/releases/${release}/${model !== "nokia" ? model + "/" : ""}paths.json`
  const pathResponse = await fetch(versionUrl)

  if (pathResponse.ok) {
    const pathJson = await pathResponse.json()
    paths = pathJson.map((k: PathDef) => ({...k, "is-state": ("is-state" in k ? "R" : "RW")}))
  } else {
    throw error(404, `Error fetching ${release} yang tree`)
  }

  const stateFilter = paths.filter((x: PathDef) => stateInput == "" ? true : x["is-state"] == stateInput)
  const searchFilter = stateFilter.filter((x: PathDef) => searchBasedFilter(x, searchInput))
  const featFilter = featSelect?.length ? searchFilter.filter((x: PathDef) => featureBasedFilter(x, featSelect)) : searchFilter

  // Tree Builder
  class TreeNode {
    name: string
    type: string
    children: YangTreeResponseMessage[]
	  details: YangTreeContainer | PathDef
    constructor(name: string, isKey: boolean, details: YangTreeContainer | PathDef, type: string) {
      isKey ? this.name = name + "*" : this.name = name
      this.children = []
      this.details = details
      this.type = type
    }
  }

  const node = new TreeNode(release, false, {path: ""}, "folder")
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

    const xpath = entry["path"]
    const clean = removeKeyDefault(xpath)
    const segments = clean.split("/").slice(1)
    const segLen = segments.length

    const containerPath: string[] = []

    segments.forEach((segment: string, i: number) => {
      containerPath.push(segment)
      if(segment.includes("[")) keys = extractBetween(segment)
      let childNode = currentNode.children.find((node: { name: string }) => node.name === segment)

      if (!childNode) {
        let isKey = false
        const isLast = (i == (segLen - 1))

        const paramPath = (isLast ? entry : {"path" : "/" + containerPath.join("/")})
        if(keys.length > 0 && keys.includes(segment)) isKey = true
        const nodeType = (isLast ? "file" : "folder")

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