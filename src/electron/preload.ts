import { contextBridge, ipcRenderer } from 'electron'
import { handlers } from './handlers'

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
