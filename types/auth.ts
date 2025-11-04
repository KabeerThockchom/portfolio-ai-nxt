/**
 * Authentication and User Types
 * Based on PortfolioAIEY schema
 */

export interface User {
  user_id: number
  name: string
  username: string
  email: string
  password: string
  dob: string
  phone_number: string
}

export interface UserSession {
  data: User
  message: string
}

export interface LoginRequest {
  email_id: string
  password: string
}

export interface VoiceLoginRequest {
  name: string
  date_of_birth: string
}

export interface AuthResponse {
  success: boolean
  data?: User
  message: string
  error?: string
}

export interface UserListResponse {
  success: boolean
  data?: User[]
  count?: number
  message: string
  error?: string
}
