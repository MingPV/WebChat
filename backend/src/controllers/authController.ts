import { Response } from 'express'
import { startSession } from 'mongoose'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import winston from 'winston'

import { ExpiresInDays } from '@/constants'
import {
  NewPasswordPayload,
  ResetPasswordPayload,
  SignInPayload,
  SignUpPayload
} from '@/contracts/auth'
import {
  resetPasswordService,
  verificationService,
  userService
} from '@/services'
import { jwtSign } from '@/utils/jwt'
import {
  IBodyRequest,
  ICombinedRequest,
  IContextRequest,
  IUserRequest
} from '@/contracts/request'
import { createCryptoString } from '@/utils/cryptoString'
import { createDateAddDaysFromNow } from '@/utils/dates'
import { UserMail } from '@/mailer'
import { createHash } from '@/utils/hash'
import { redis } from '@/dataSources'

export const authController = {
  signIn: async (
    { body: { email, password } }: IBodyRequest<SignInPayload>,
    res: Response
  ) => {
    try {
      const user = await userService.getByEmail(email)

      const comparePassword = user?.comparePassword(password)
      if (!user || !comparePassword) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: ReasonPhrases.NOT_FOUND,
          status: StatusCodes.NOT_FOUND
        })
      }

      console.log('mingza')

      const { accessToken } = jwtSign(user.id)

      // Set the access token as a cookie in the response
      res.cookie('access_token', accessToken, {
        httpOnly: true, // To prevent access from JavaScript
        secure: true, // Only send cookies over HTTPS in production
        sameSite: 'none', // ต้องเป็น 'None' ถ้า cross-site
        expires: new Date(Date.now() + 3600 * 24000) // Set expiry (24 hour here)
      })

      return res.status(StatusCodes.OK).json({
        data: { accessToken },
        message: ReasonPhrases.OK,
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  signUp: async (
    {
      body: { email, password, username, profile_url }
    }: IBodyRequest<SignUpPayload>,
    res: Response
  ) => {
    const session = await startSession()
    try {
      const isUserExist = await userService.isExistByEmail(email)
      const isUsernameExist = await userService.isExistByUsername(username)

      if (isUserExist || isUsernameExist) {
        return res.status(StatusCodes.CONFLICT).json({
          message: ReasonPhrases.CONFLICT,
          status: StatusCodes.CONFLICT
        })
      }

      session.startTransaction()
      const hashedPassword = await createHash(password)

      console.log('ming2')
      console.log(username)

      const user = await userService.create(
        {
          email,
          password: hashedPassword,
          username: username,
          profile_url: profile_url
        },
        session
      )

      const cryptoString = createCryptoString()

      const dateFromNow = createDateAddDaysFromNow(ExpiresInDays.Verification)

      const verification = await verificationService.create(
        {
          userId: user.id,
          email,
          accessToken: cryptoString,
          expiresIn: dateFromNow
        },
        session
      )

      await userService.addVerificationToUser(
        {
          userId: user.id,
          verificationId: verification.id
        },
        session
      )

      const { accessToken } = jwtSign(user.id)

      const userMail = new UserMail()

      userMail.signUp({
        email: user.email
      })

      userMail.verification({
        email: user.email,
        accessToken: cryptoString
      })

      await session.commitTransaction()
      session.endSession()

      // Set the access token as a cookie in the response
      res.cookie('access_token', accessToken, {
        httpOnly: true, // To prevent access from JavaScript
        secure: true, // Only send cookies over HTTPS in production
        sameSite: 'none', // ต้องเป็น 'None' ถ้า cross-site
        expires: new Date(Date.now() + 3600 * 24000) // Set expiry (1 hour here)
      })

      return res.status(StatusCodes.OK).json({
        data: { accessToken },
        message: ReasonPhrases.OK,
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      if (session.inTransaction()) {
        await session.abortTransaction()
        session.endSession()
      }

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  signOut: async (
    { context: { user, accessToken } }: IContextRequest<IUserRequest>,
    res: Response
  ) => {
    try {
      // await redis.client.set(`expiredToken:${accessToken}`, `${user.id}`, {
      //   EX: process.env.REDIS_TOKEN_EXPIRATION,
      //   NX: true
      // })

      // set cookie token
      res.cookie('access_token', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires: new Date(Date.now() - 1)
      })

      return res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        status: StatusCodes.OK
      })
    } catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  resetPassword: async (
    { body: { email } }: IBodyRequest<ResetPasswordPayload>,
    res: Response
  ) => {
    const session = await startSession()

    try {
      const user = await userService.getByEmail(email)

      if (!user) {
        return res.status(StatusCodes.OK).json({
          message: ReasonPhrases.OK,
          status: StatusCodes.OK
        })
      }

      session.startTransaction()

      const cryptoString = createCryptoString()

      const dateFromNow = createDateAddDaysFromNow(ExpiresInDays.ResetPassword)

      const resetPassword = await resetPasswordService.create(
        {
          userId: user.id,
          accessToken: cryptoString,
          expiresIn: dateFromNow
        },
        session
      )

      await userService.addResetPasswordToUser(
        {
          userId: user.id,
          resetPasswordId: resetPassword.id
        },
        session
      )

      const userMail = new UserMail()

      userMail.resetPassword({
        email: user.email,
        accessToken: cryptoString
      })

      await session.commitTransaction()
      session.endSession()

      return res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      if (session.inTransaction()) {
        await session.abortTransaction()
        session.endSession()
      }
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  },

  newPassword: async (
    {
      body: { password },
      params
    }: ICombinedRequest<null, NewPasswordPayload, { accessToken: string }>,
    res: Response
  ) => {
    const session = await startSession()
    try {
      const resetPassword = await resetPasswordService.getByValidAccessToken(
        params.accessToken
      )

      if (!resetPassword) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: ReasonPhrases.FORBIDDEN,
          status: StatusCodes.FORBIDDEN
        })
      }

      const user = await userService.getById(resetPassword.user)

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: ReasonPhrases.NOT_FOUND,
          status: StatusCodes.NOT_FOUND
        })
      }

      session.startTransaction()
      const hashedPassword = await createHash(password)

      await userService.updatePasswordByUserId(
        resetPassword.user,
        hashedPassword,
        session
      )

      await resetPasswordService.deleteManyByUserId(user.id, session)

      const { accessToken } = jwtSign(user.id)

      const userMail = new UserMail()

      userMail.successfullyUpdatedPassword({
        email: user.email
      })

      await session.commitTransaction()
      session.endSession()

      return res.status(StatusCodes.OK).json({
        data: { accessToken },
        message: ReasonPhrases.OK,
        status: StatusCodes.OK
      })
    } catch (error) {
      winston.error(error)

      if (session.inTransaction()) {
        await session.abortTransaction()
        session.endSession()
      }

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
        status: StatusCodes.BAD_REQUEST
      })
    }
  }
}
