import { drizzle } from 'drizzle-orm/better-sqlite3'
import { app } from 'electron'
import path from 'path'

import * as schema from './schema'

import type { BatchItem } from 'drizzle-orm/batch'

export const dbPath = app?.isPackaged
  ? path.resolve(app.getPath('userData'), 'data.db')
  : 'dev.db'

export const db = drizzle(dbPath, { schema })

export type BatchArray = [BatchItem<'sqlite'>, ...BatchItem<'sqlite'>[]]
