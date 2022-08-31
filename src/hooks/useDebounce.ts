import { useRef } from 'react'

const useDebounce = <Fn extends Function>(fn: Fn, delay = 500) => {
  const ref = useRef<number>()

  const debouncedFunction = (...args: unknown[]) => {
    window.clearTimeout(ref.current)

    ref.current = window.setTimeout(() => {
      fn(...args)
    }, delay)
  }

  return debouncedFunction as unknown as Fn
}

export default useDebounce
