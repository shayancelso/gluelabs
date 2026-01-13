'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { useStore } from '@/lib/store'

type StoreApi = ReturnType<typeof useStore>

const StoreContext = createContext<StoreApi | undefined>(undefined)

export interface StoreProviderProps {
  children: ReactNode
}

export function StoreProvider({ children }: StoreProviderProps) {
  const storeRef = useRef<StoreApi>()

  if (!storeRef.current) {
    storeRef.current = useStore
  }

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStoreContext() {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error('useStoreContext must be used within StoreProvider')
  }
  return store
}
