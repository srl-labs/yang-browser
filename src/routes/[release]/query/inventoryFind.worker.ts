import { error, type HttpError } from "@sveltejs/kit"

import type { InventoryFindPostMessage } from "./structure"

onmessage = async (event: MessageEvent<InventoryFindPostMessage>) => {
  const payload = event.data

  postMessage({ type: "progress", value: 50 })
  try {
    const response = await fetch("/api/nsp/find", {
      method: "POST", body: JSON.stringify(payload)
    })
    if(!response.ok) {
      const errorText = await response.text();
      throw error(404, errorText);
    }

    postMessage({ type: "progress", value: 85 })
    await new Promise(res => setTimeout(res, 500))

    const output = await response.json()

    postMessage({
      type: "complete",
      success: true,
      message: "",
      output,
    })
    
  } catch(error) {
    postMessage({ type: "complete", success: false, message: (error as HttpError).body.message })
  }
}

export {}