import { error } from "@sveltejs/kit";
import type { PathDef } from "$lib/structure";
import type { FetchPostMessage } from "$lib/workers/structure";
import { removeKeyDefault } from "$lib/components/functions";

onmessage = async (event: MessageEvent<FetchPostMessage>) => {
  const { model, release, urlOrigin } = event.data;

  let paths: PathDef[] = []

  const versionUrl = `${urlOrigin}/releases/${release}/${model !== "nokia" ? model + "/" : ""}paths.json`
  const pathResponse = await fetch(versionUrl)

  if (pathResponse.ok) {
    const pathJson = await pathResponse.json()
    paths = pathJson.map((k: any) => ({...k, "is-state": ("is-state" in k ? "R" : "RW")}))
  } else {
    throw error(404, `Error fetching ${release} yang tree`)
  }

  // Tree Builder
  class TreeNode {
    name: string;
    type: string;
    children: any[];
	  details: any | PathDef;
    constructor(name: string, isKey: boolean, details: any | PathDef, type: string) {
      isKey ? this.name = name + "*" : this.name = name
      this.type = type;
      this.children = [];
      this.details = details;
    }
  }

  const root = new TreeNode(release, false, {}, "folder");
  const extractBetween = (str: string) => {
    const regex = /\[(.*?)\]/g;
    const matches = [];
    let match;
    while ((match = regex.exec(str)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  };

  let keys: string[] = [];
  for (const entry of paths) {
    let currentNode = root;

    let xpath = entry["path"];
    let clean = removeKeyDefault(xpath);
    let segments = clean.split("/").slice(1);
    let segLen = segments.length;

    let containerPath = []

    segments.forEach((segment: string, i: number) => {
      containerPath.push(segment)
      if(segment.includes("[")) keys = extractBetween(segment);
      let childNode = currentNode.children.find((node: { name: string; }) => node.name === segment);

      if (!childNode) {
        let isKey = false;
        let isLast = (i == (segLen - 1))

        let paramPath = (isLast ? entry : {"path" : "/" + containerPath.join("/")});
        if(keys.length > 0 && keys.includes(segment)) isKey = true;
        let nodeType = (isLast ? "file" : "folder")
        
        childNode = new TreeNode(segment, isKey, paramPath, nodeType)
        if(isKey) {
          currentNode.children = [childNode].concat(currentNode.children)
        }
        else currentNode.children.push(childNode);

        if(isLast) containerPath.pop()
      }

      currentNode = childNode;
    })
  }

  postMessage(root);
};

export {};