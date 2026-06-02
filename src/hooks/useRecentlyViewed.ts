import { useState, useCallback } from 'react'

const KEY = 'el-mercader-recently-viewed'
const MAX = 8

function readIds(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}

export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>(readIds)

  const addId = useCallback((id: string) => {
    const next = [id, ...readIds().filter((x) => x !== id)].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(next))
    setIds(next)
  }, [])

  return { ids, addId }
}
