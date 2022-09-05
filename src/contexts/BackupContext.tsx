import { createContext, PropsWithChildren, useContext, useEffect } from 'react'
import usePersistedState from '../hooks/usePersistedState'

interface BackupContextData {
  setBackupPath: (newPath: string) => void
  backupPath?: string
}

export const BackupContext = createContext({} as BackupContextData)

export const BackupProvider = ({ children }: PropsWithChildren<{}>) => {
  const [backupPath, setBackupPath] = usePersistedState('backupPath')

  useEffect(() => {
    if (!backupPath) return

    const handleMakeBackup = async () => {
      await window.makeBackup(backupPath)
      console.log('BACKUP DONE')
    }

    handleMakeBackup()

    const interval = setInterval(() => handleMakeBackup(), 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [backupPath])

  return (
    <BackupContext.Provider value={{ setBackupPath, backupPath }}>
      {children}
    </BackupContext.Provider>
  )
}

export const useBackup = () => useContext(BackupContext)
