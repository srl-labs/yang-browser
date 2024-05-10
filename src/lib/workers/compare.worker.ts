import type { PathDef } from "$lib/structure";
import type { PostMessage, ResponseMessage } from "$lib/workers/structure";

onmessage = (event: MessageEvent<PostMessage>) => {
  const { x, y } = event.data;

  const xOnlyPath = x.map((k :PathDef) => k.path)
  const yOnlyPath = y.map((k :PathDef) => k.path)

  const getPathObj = (list: PathDef[], path: string) => list.filter((k :PathDef) => k.path === path)

  const typeChange: ResponseMessage[] = []
  const removedFromX: ResponseMessage[] = []
  const newInY: ResponseMessage[] = []

  const setX = new Set(xOnlyPath)
  const setY = new Set(yOnlyPath)

  for (const item of setX) {
    if (setY.has(item)) {
      const xObj = getPathObj(x, item)[0]
      const yObj = getPathObj(y, item)[0]
      if(xObj.type !== yObj.type) {
        typeChange.push({...yObj, fromType: xObj.type, fromRel: xObj.release, compare: "~"})
      }
    } else {
      const xObj = getPathObj(x, item)[0]
      removedFromX.push({...xObj, compare: "-"})
    }
  }

  for (const item of setY) {
    if (!setX.has(item)) {
      const yObj = getPathObj(y, item)[0]
      newInY.push({...yObj, compare: "+"})
    }
  }

  const sortedList = [...newInY, ...removedFromX, ...typeChange].sort((a, b) => {
    const keyA = a["path"]
    const keyB = b["path"]
    if (keyA < keyB) return -1
    if (keyA > keyB) return 1
    return 0
  })

  //console.log('Worker request processed');
  const message = sortedList;
  postMessage(message);
};

export {};