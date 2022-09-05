import { handlers } from '../src/electron/handlers'

type IApi = typeof handlers

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    api: IApi
    store: {
      set: (key: string, value: any) => void
      get: (key: string) => any
    }
    dialog: {
      getBackupPath: () => string | undefined
    }
    makeBackup: (backupPath: string) => Promise<void>
    getNotes: () => string
    saveNotes: (data: string) => Promise<void>
  }
}
