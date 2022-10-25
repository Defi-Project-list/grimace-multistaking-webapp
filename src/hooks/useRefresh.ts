import { useContext } from 'react'
import { RefreshContext } from 'src/contexts/RefreshContext'

const useRefresh = () => {
  const { fast, normal, slow, triggerRefresh } = useContext(RefreshContext)
  return { fastRefresh: fast, normalRefresh: normal, slowRefresh: slow, triggerRefresh }
}

export default useRefresh