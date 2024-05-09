import type { Platforms, PlatformFeatures, PathDef } from '$lib/structure'

export function reverseSortVersions(versions: string[]) {
  return versions.sort((a, b) => {
    return b.localeCompare(a, undefined, { numeric: true });
  });
}

export function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('-translate-x-0')
  document.getElementById('sidebar')?.classList.toggle('-translate-x-full')
  document.getElementById('open-sidebar')?.classList.toggle('hidden')
  document.getElementById('close-sidebar')?.classList.toggle('hidden')
}

export function closeSidebar() {
  if (document.getElementById('open-sidebar')?.classList.contains("hidden")) {
    toggleSidebar();
  }
}

export function extractFeatures (data: Platforms): [PlatformFeatures, string[]] {
  let platforms: PlatformFeatures = {}
  let allFeatures: string[] = []
  let uniqueFeatures: string[] = []

  if (Object.keys(data)?.length) {
    for (const [platform, features] of Object.entries(data)) {
      let platformFeatures = features.split(/\s+/)
      platforms[platform] = platformFeatures
      allFeatures = allFeatures.concat(platformFeatures)
    }
    uniqueFeatures = [...new Set(allFeatures)].sort()
  }

  return [platforms, uniqueFeatures]
}

export function searchBasedFilter(x: any, searchTerm: string, showPrefix: boolean = false) {
  const keys = searchTerm.split(/\s+/)
  const searchStr = `${showPrefix ? x["path-with-prefix"] : x.path};${x.type}`
  return keys.every(x => searchStr.includes(x))
}

export function markFilter(x: any, term: string, showPrefix: boolean = false) {
  const keys = term.split(/\s+/)
  const pattern = new RegExp(keys.join('|'), 'g')
  const markClass = "text-nokia-blue dark:text-yellow-400 bg-white dark:bg-gray-800 font-bold"
  const markTerm = (str: string) => str.replace(pattern, (match: any) => `<mark class="${markClass}">${match}</mark>`)
  const markedPath = markTerm(showPrefix ? x["path-with-prefix"] : x.path)
  const markedType = markTerm(x.type)
  if("fromType" in x) {
    const markedFromType = markTerm(x.fromType)
    if(showPrefix) {
      return {...x, "path-with-prefix": markedPath, type: markedType, fromType: markedFromType}
    } else {
      return {...x, path: markedPath, type: markedType, fromType: markedFromType}
    }
  }
  if(showPrefix) {
    return {...x, "path-with-prefix": markedPath, type: markedType}
  } else {
    return {...x, path: markedPath, type: markedType}
  }
}

export function markRender (node: HTMLSpanElement, text:string) {
  const action = () => node.innerHTML = text
  action()
  return {
    update(obj: string) {
      text = obj
      action()
    },
  }
}

// do not alter the flow in any means
export function featureBasedFilter (x: PathDef, f: string[]): boolean {
  const isOperator = (arg: string): boolean => (arg === "|" || arg === "&")
  
  const featureFilter = (data: string[]): string => {
    // order of execution is important
    let tmp = data.map(i => `(${i})`).join(", ")

    tmp = tmp.replaceAll("\n", " ")

    if (tmp.includes("not")) {
      tmp = tmp.replaceAll("not ", "!")
    }

    tmp = tmp.replaceAll("srl_nokia-feat:", "")
      .replaceAll("srl-feat:", "")
      .replaceAll("srl_feat:", "")
      .replaceAll(" or ", " | ")
      .replaceAll(", ", " & ")
      .replaceAll("-", "_")

    return tmp
  }

  if (f.length > 0 && x["if-features"]) {
    let exp = featureFilter(x["if-features"])

    // Since future-0-0 does not exist, mark as do not exist by default
    exp = exp.replace(/future_0_0/g, "=")

    for (const feature of f) {
      let d2h = feature.replace(/-/g, "_")
      if (exp.includes(d2h)) {
        exp = exp.replace(new RegExp(`\\b${d2h}\\b`, 'g'), "+")
      }
    }

    exp = exp.replaceAll("!+", "=")
    let expSplit = exp.split(" ")
    let expResult = []
    const validOperators = ["+", "=", "&", "|"]

    for (let i = 0; i < expSplit.length; i++) {
      if (expSplit[i] === "+" || expSplit[i] === "=") {
        expResult.push(expSplit[i])
      } else {
        let validation = validOperators.some(operator => expSplit[i].includes(operator))
        if (!validation) {
          let tmpRep = expSplit[i].replace(/[a-z0-9_]+/g, "=").replace("!=", "+")
          expResult.push(tmpRep)
        } else {
          expResult.push(expSplit[i])
        }
      }
      if (isOperator(expSplit[i + 1])) {
        expResult.push(expSplit[i + 1])
        i++
      }
    }

    if (expResult.length > 0) {
      if (isOperator(expResult[expResult.length - 1])) {
        expResult.pop()
      }
      let result = expResult.join(" ")
      result = result.replaceAll("+", "1").replaceAll("=", "0")

      return evalBoolString(result)
    }
  }

  return true
}

// cloudfare pages dont support eval() or Function()
function evalBoolString(expression: string): boolean {
  const tokens = expression.split(/([()&|!])/).filter(token => token.trim() !== '');
  let index = 0;

  const consume = (expected: string) => {
    if (tokens[index] === expected) {
      index++;
    } else {
      throw new Error(`Feature Evaluation: Expected '${expected}' but found '${tokens[index]}'`);
    }
  }

  const parseFactor = () => {
    const token = tokens[index++].trim();
    if (token === '(') {
      const result = parseExpression();
      consume(')');
      return result;
    } else if (token === '1') {
      return true;
    } else if (token === '0') {
      return false;
    } else if (token === '!') {
      return !parseFactor();
    } else {
      throw new Error(`Feature Evaluation: Invalid token '${token}'`);
    }
  }

  const parseTerm = () => {
    let result = parseFactor();
    while (tokens[index] === '&') {
      consume('&');
      result = result & parseFactor();
    }
    return result;
  }

  const parseExpression = () => {
    let result = parseTerm();
    while (tokens[index] === '|') {
      consume('|');
      result = result | parseTerm();
    }
    return result;
  }

  return Boolean(parseExpression());
}