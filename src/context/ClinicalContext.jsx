import { useClinicalState } from '../hooks/useClinicalState.js'

import { ClinicalContext } from './clinical.js'

export function ClinicalProvider({ children }) {
  const value = useClinicalState()

  return (
    <ClinicalContext.Provider value={value}>
      {children}
    </ClinicalContext.Provider>
  )
}
