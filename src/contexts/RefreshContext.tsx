import React, { useState, useEffect, useRef } from 'react'

const FAST_INTERVAL = 10000
const NORMAL_INTERVAL = 30000
const SLOW_INTERVAL = 60000

const RefreshContext = React.createContext({ slow: 0, normal: 0, fast: 0, triggerRefresh: () => {} })

// Check if the tab is active in the user browser
const useIsBrowserTabActive = () => {
  const isBrowserTabActiveRef = useRef(true)

  useEffect(() => {
    const onVisibilityChange = () => {
      isBrowserTabActiveRef.current = !document.hidden
    }

    window.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return isBrowserTabActiveRef
}

// This context maintain 2 counters that can be used as a dependencies on other hooks to force a periodic refresh
const RefreshContextProvider = ({ children }) => {
  const [slow, setSlow] = useState(0)
  const [normal, setNormal] = useState(0)
  const [fast, setFast] = useState(0)
  const isBrowserTabActiveRef = useIsBrowserTabActive()

  const triggerRefresh = () => {
    setFast((prev) => prev + 1)
    setNormal((prev) => prev + 1)
    setSlow((prev) => prev + 1)
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isBrowserTabActiveRef.current) {
        setFast((prev) => prev + 1)
      }
    }, FAST_INTERVAL)
    return () => clearInterval(interval)
  }, [isBrowserTabActiveRef])

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isBrowserTabActiveRef.current) {
        setNormal((prev) => prev + 1)
      }
    }, NORMAL_INTERVAL)
    return () => clearInterval(interval)
  }, [isBrowserTabActiveRef])

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isBrowserTabActiveRef.current) {
        setSlow((prev) => prev + 1)
      }
    }, SLOW_INTERVAL)
    return () => clearInterval(interval)
  }, [isBrowserTabActiveRef])
  
  return <RefreshContext.Provider value={{ slow, normal, fast, triggerRefresh }}>{children}</RefreshContext.Provider>
}

export { RefreshContext, RefreshContextProvider }
