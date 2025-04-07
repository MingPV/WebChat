// import { Model, ObjectId } from 'mongoose'

// export interface IUser {
//   id: ObjectId
//   email: string
//   password: string
//   username: string
//   firstName?: string
//   lastName?: string
//   verified: boolean
//   verifications?: ObjectId[]
//   resetPasswords?: ObjectId[]
// }

// export interface IUserMethods {
//   comparePassword: (password: string) => boolean
// }

// export type UserModel = Model<IUser, unknown, IUserMethods>

// export type VerificationRequestPayload = Pick<IUser, 'email'>

// export type UpdateProfilePayload = Required<
//   Pick<IUser, 'firstName' | 'lastName'>
// >

// export type UpdateEmailPayload = Pick<IUser, 'email' | 'password'>

// export interface UpdatePasswordPayload {
//   oldPassword: string
//   newPassword: string
// }

// export interface DeleteProfilePayload {
//   password: string
// }
