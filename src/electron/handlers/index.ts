import { ipcMain } from 'electron'
import { getProducts } from './products'

export const handlers = {
  getProducts
}

export const initHandlers = () => {
  Object.entries(handlers).forEach(([channel, handler]) => {
    ipcMain.handle(channel, handler)
  })
}
