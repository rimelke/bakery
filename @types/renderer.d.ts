import { handlers } from '../src/electron/handlers'

type IApi = typeof handlers

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    api: IApi
  }
}
