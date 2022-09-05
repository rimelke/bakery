import { PrismaClient } from '@prisma/client'
import path from 'path'
import { app, ipcRenderer } from 'electron'

const isProd = app?.isPackaged ?? !ipcRenderer.sendSync('isDev')

const userDataPath =
  app?.getPath('userData') || ipcRenderer.sendSync('userDataPath')

const prisma = new PrismaClient(
  isProd
    ? {
        datasources: {
          db: {
            url: `file:${path.resolve(userDataPath, 'data.db')}`
          }
        }
      }
    : undefined
)

export default prisma
