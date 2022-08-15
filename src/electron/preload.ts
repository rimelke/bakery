import { contextBridge, ipcRenderer } from 'electron'
import { handlers } from './handlers'

contextBridge.exposeInMainWorld(
  'api',
  Object.keys(handlers)
    .map((channel) => ({ [channel]: () => ipcRenderer.invoke(channel) }))
    .reduce((acc, obj) => ({ ...acc, ...obj }), {})
)
