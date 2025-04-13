// import { hash } from 'bcrypt'
import { hash } from 'bcryptjs'

export const createHash = (string: string) => hash(string, 10)
