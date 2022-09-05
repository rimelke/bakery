import { useState } from 'react'

const usePersistedState = <T = any>(key: string, defaultValue?: T) => {
  const [value, setValue] = useState<T | undefined>(
    (window.store.get(key) as T) || defaultValue
  )

  const handleSetValue = (newValue: T | undefined) => {
    window.store.set(key, newValue)
    setValue(newValue)
  }

  return [value, handleSetValue] as const
}

export default usePersistedState
