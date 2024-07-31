// space based string split
function spaceSplit(str: string) {
  return str.trim().split(/(\s+)/)
}

// Function to remove parent from the xpath during passon
export function urlPathPasson(urlPath: string) {
  let passon = urlPath != "" ? urlPath.split("/").filter(Boolean) : []
  passon.shift()
  return passon.join("/")
}

// Function to check if an item path matches the URL path
function isUrlPath(item: any, urlPath: string) {
  // Split the searchPath into segments
  let pathSegments = urlPath !== "" ? urlPath.split("/").filter(Boolean) : []
  let currentSegment = pathSegments.shift();

  // Determine if this folder matches the current path segment
  let isCurrentPathMatch = currentSegment && item.name === currentSegment;

  // Determine if the folder or its children should be shown due to path search
  if(pathSegments.length > 0 && isCurrentPathMatch) return true
  else return false
}

// Function to check if an item matches the search query
export function matchesSearch(item: any, searchTerm: string, urlPath: string) {
  if (urlPath === "" && searchTerm === "") return false
  else if (urlPath !== "" && searchTerm === "") {
    return isUrlPath(item, urlPath)
  }
  else {
    let result = false
    if (urlPath !== "") result = result || isUrlPath(item, searchTerm, urlPath)
    const searchKeys = spaceSplit(searchTerm).map(x => x.toLowerCase())
    result = result ||  searchKeys.some(v => item.name.includes(v))
    return result
  }
}

// Recursive determine if a folder or its children match the search query
export function folderMatchesSearch(folder: any, searchTerm: string, urlPath: string) {
  let result = false

  if (urlPath === "" && searchTerm === "") return false
  else if (urlPath !== "" && searchTerm === "") {
    return isUrlPath(folder, urlPath)
  }
  else if (urlPath !== "") {
    result = result || isUrlPath(folder, urlPath)
  }

  if (matchesSearch(folder, searchTerm, urlPath)) {
    result = result || true;
  }

  if (folder.children) {
    result = result || folder.children.some((item: any) => {
      if (item.type === "folder") {
        return folderMatchesSearch(item, searchTerm, urlPath);
      }
      else {
        return matchesSearch(item, searchTerm, urlPath);
      }
    });
  }

  return result;
}