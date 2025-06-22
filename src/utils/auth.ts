interface TokenData {
  access_token: string
  expires_in: number
  token_type: string
  refresh_token?: string
}

export const setToken = (tokenData: TokenData | string) => {
  if (typeof tokenData === "string") {
    // Backward compatibility - treat as access token
    localStorage.setItem("access_token", tokenData)
    // Set a default expiration of 24 hours for old tokens
    const expirationTime = Date.now() + 24 * 60 * 60 * 1000
    localStorage.setItem("token_expiration", expirationTime.toString())
    return
  }

  localStorage.setItem("access_token", tokenData.access_token)

  if (tokenData.refresh_token) {
    localStorage.setItem("refresh_token", tokenData.refresh_token)
  }

  // Calculate expiration time (current time + expires_in seconds)
  // Default to 24 hours if expires_in is not provided
  const expiresIn = tokenData.expires_in || 24 * 60 * 60
  const expirationTime = Date.now() + expiresIn * 1000
  localStorage.setItem("token_expiration", expirationTime.toString())

  console.log("Token stored with expiration:", new Date(expirationTime))
}

export const getToken = () => {
  return localStorage.getItem("access_token")
}

export const getRefreshToken = () => {
  return localStorage.getItem("refresh_token")
}

export const removeToken = () => {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
  localStorage.removeItem("token_expiration")
}

export const isTokenExpired = (): boolean => {
  const token = getToken()
  if (!token) return true

  const expirationTime = localStorage.getItem("token_expiration")
  if (!expirationTime) {
    // If no expiration time, assume token is still valid for backward compatibility
    return false
  }

  const now = Date.now()
  const expiration = Number.parseInt(expirationTime)

  // Consider token expired if it expires within the next 5 minutes
  const bufferTime = 5 * 60 * 1000 // 5 minutes in milliseconds

  return now >= expiration - bufferTime
}

export const getTokenExpirationTime = (): Date | null => {
  const expirationTime = localStorage.getItem("token_expiration")
  if (!expirationTime) return null

  return new Date(Number.parseInt(expirationTime))
}

export const isTokenValid = (): boolean => {
  const token = getToken()
  return !!(token && !isTokenExpired())
}

