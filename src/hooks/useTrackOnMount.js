import { useEffect, useRef } from "react"

/**
 * Runs an analytics callback once per mount. Ref-guarded so StrictMode's
 * double-invoked dev effects don't double-count screen-entry events.
 * @param {() => void} track
 */
export function useTrackOnMount(track) {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (hasTracked.current) return
    hasTracked.current = true
    track()
  }, [track])
}
