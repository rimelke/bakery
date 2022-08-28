import { ipcMain } from 'electron'
import * as products from './products'

export const handlers = {
  products
}

export const initHandlers = () => {
  Object.values(handlers).forEach((section) => {
    Object.entries(section).forEach(
      ([channel, handler]: [string, Function]) => {
        ipcMain.handle(channel, (_, ...args) => handler.apply(null, args))
      }
    )
  })
}
