import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

export interface TokenPayload {
  userId: string
  email: string
  organizationId?: string
  isSuperAdmin: boolean
  tokenId: string
}

export interface RefreshTokenPayload {
  userId: string
  tokenId: string
}

export class TokenService {
  private static accessSecret = process.env.JWT_ACCESS_SECRET!
  private static refreshSecret = process.env.JWT_REFRESH_SECRET!

  // Generar Access Token (15 minutos)
  static generateAccessToken(payload: Omit<TokenPayload, 'tokenId'>): string {
    const tokenId = uuidv4()
    return jwt.sign(
      { ...payload, tokenId },
      this.accessSecret,
      { expiresIn: '15m' }
    )
  }

  // Generar Refresh Token (7 días)
  static generateRefreshToken(userId: string): string {
    const tokenId = uuidv4()
    return jwt.sign(
      { userId, tokenId },
      this.refreshSecret,
      { expiresIn: '7d' }
    )
  }

  // Verificar Access Token
  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.accessSecret) as TokenPayload
    } catch {
      return null
    }
  }

  // Verificar Refresh Token
  static verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      return jwt.verify(token, this.refreshSecret) as RefreshTokenPayload
    } catch {
      return null
    }
  }

  // Generar par de tokens
  static generateTokenPair(payload: Omit<TokenPayload, 'tokenId'>) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload.userId),
    }
  }
}