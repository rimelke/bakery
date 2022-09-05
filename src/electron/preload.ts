import { contextBridge, ipcRenderer } from 'electron'
import { handlers } from './handlers'
import Store from 'electron-store'

const store = new Store()

contextBridge.exposeInMainWorld(
  'api',
  Object.entries(handlers)
    .map(([section, sectionHandlers]) => ({
      [section]: Object.keys(sectionHandlers)
        .map((channel) => ({
          [channel]: (...args: any[]) => ipcRenderer.invoke(channel, ...args)
        }))
        .reduce((acc, obj) => ({ ...acc, ...obj }), {})
    }))
    .reduce((acc, obj) => ({ ...acc, ...obj }), {})
)

contextBridge.exposeInMainWorld('store', {
  set: (key: string, value: any) => {
    if (value) store.set(key, value)
    else store.delete(value)
  },
  get: (key: string) => store.get(key)
})

contextBridge.exposeInMainWorld('dialog', {
  getBackupPath: () => ipcRenderer.sendSync('dialog:getBackupPath')
})

contextBridge.exposeInMainWorld('makeBackup', (backupPath: string) =>
  ipcRenderer.invoke('makeBackup', backupPath)
)

contextBridge.exposeInMainWorld('getNotes', () =>
  ipcRenderer.sendSync('getNotes')
)

contextBridge.exposeInMainWorld('saveNotes', (data: string) =>
  ipcRenderer.invoke('saveNotes', data)
)
