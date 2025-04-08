import { NextFunction, Request, Response } from 'express'

import { getAccessTokenFromHeaders } from '@/utils/headers'
import { jwtVerify } from '@/utils/jwt'
import { userService } from '@/services'
import { redis } from '@/dataSources'

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    Object.assign(req, { context: {} })

    // const { accessToken } = getAccessTokenFromHeaders(req.headers)
    const accessToken = req.cookies['access_token']

    if (!accessToken) return next()

    const { id } = jwtVerify({ accessToken })
    if (!id) return next()

    // redirect to sign-in page if no token

    // implement later

    // const isAccessTokenExpired = await redis.client.get(
    //   `expiredToken:${accessToken}`
    // )

    // if (isAccessTokenExpired) return next()

    const user = await userService.getById(id)
    if (!user) return next()

    Object.assign(req, {
      context: {
        user,
        accessToken
      }
    })

    return next()
  } catch (error) {
    return next()
  }
}
