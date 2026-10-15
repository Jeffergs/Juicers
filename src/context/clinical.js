import { createContext, useContext } from 'react'
export const ClinicalContext = createContext(null)
export function useClinical() {
  const ctx = useContext(ClinicalContext)

  if (!ctx) {
    throw new Error('useClinical precisa estar dentro de ClinicalProvider')
  }

  return ctx
}