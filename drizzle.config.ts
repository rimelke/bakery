import path from 'path'

import type { Config } from 'drizzle-kit'

const drizzleConfig = {
  schema: path.resolve(__dirname, 'src/db/schema.ts'),
  dialect: 'sqlite',
  out: 'drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
} satisfies Config

export default drizzleConfig
