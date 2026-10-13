import { createContext, useContext } from 'react'

export const PatientFollowupContext = createContext(null)

// Sidebar is also used in the doctor's layout, outside this provider.
export function usePatientFollowup() {
    return useContext(PatientFollowupContext)
}
