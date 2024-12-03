import { removeKeyDefault } from "$lib/components/functions"
import type { YangTreeResponseMessage } from "$lib/workers/structure"

export function nameMatchesTerm(urlPath: string, targetName: string) {
  const searchKeys = urlPath.split(/(\s+)/).map(x => x.toLowerCase())
  return searchKeys.some(v => targetName.indexOf(v) !== -1)
}

export function decideExpand(folder: YangTreeResponseMessage, crossLaunched: boolean = false, urlPath: string = ""): boolean {
  let result = false
  if(crossLaunched && urlPath !== "") {
    return removeKeyDefault(urlPath).indexOf(folder.details.path) !== -1
  } 
  if(urlPath !== "") {
    result = result || nameMatchesTerm(urlPath, folder.name)
    
    if(folder.children) {
      result = result || folder.children.some((item: YangTreeResponseMessage) => {
        if (item.type === "folder") {
          return decideExpand(item, crossLaunched, urlPath);
        } else {
          return nameMatchesTerm(urlPath, item.name);
        }
      })
    }
  }
  return result
}