import { customAlphabet } from 'nanoid'
const alphabet =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

const genId = customAlphabet(alphabet, 25)

export default genId
