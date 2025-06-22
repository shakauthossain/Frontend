import { setToken, getToken, getRefreshToken, isTokenExpired } from "@/utils/auth"

const BASE_URL = "http://localhost:8000"

export const loginUser = async (usernameOrEmail: string, password: string) => {
  console.log("Attempting login for:", usernameOrEmail)

  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username: usernameOrEmail,
      password: password,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("Login failed:", error)
    throw new Error(error || "Login failed")
  }

  const result = await response.json()
  console.log("Login successful, storing token data")

  // Store the complete token data
  setToken(result)

  return result
}

export const registerUser = async (userData: any) => {
  console.log("Attempting registration for:", userData.username)

  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error("Registration failed:", error)
    throw new Error(error.message || "Registration failed")
  }

  const result = await response.json()
  console.log("Registration successful")
  return result
}

export const getProfile = async () => {
  console.log("Getting profile with authenticated fetch")

  try {
    const response = await authenticatedFetch(`${BASE_URL}/profile`)

    console.log("Profile response status:", response.status)

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication failed - please login again")
      }
      if (response.status === 404) {
        throw new Error("Profile endpoint not found - check if backend server is running")
      }
      const errorText = await response.text()
      console.error("Profile fetch failed:", errorText)
      throw new Error(`Failed to fetch profile: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("Profile fetched successfully:", result)
    return result
  } catch (error) {
    console.error("Profile fetch error:", error)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Cannot connect to server - is your backend running on port 8000?")
    }
    throw error
  }
}

// Test function to check if backend is reachable
export const testBackendConnection = async () => {
  try {
    console.log("Testing backend connection...")
    const response = await fetch(`${BASE_URL}/`, {
      method: "GET",
    })
    console.log("Backend connection test - Status:", response.status)
    return response.ok
  } catch (error) {
    console.error("Backend connection test failed:", error)
    return false
  }
}

export const refreshToken = async (): Promise<boolean> => {
  const refresh_token = getRefreshToken()

  if (!refresh_token) {
    console.log("No refresh token available")
    return false
  }

  try {
    console.log("Attempting to refresh token...")

    const response = await fetch(`${BASE_URL}/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token }),
    })

    if (!response.ok) {
      console.error("Token refresh failed:", response.status)
      // If refresh endpoint doesn't exist (404), just return false
      if (response.status === 404) {
        console.log("Refresh endpoint not available")
      }
      return false
    }

    const tokenData = await response.json()
    setToken(tokenData)
    console.log("Token refreshed successfully")
    return true
  } catch (error) {
    console.error("Token refresh error:", error)
    return false
  }
}

export const ensureValidToken = async (): Promise<boolean> => {
  const token = getToken()

  if (!token) {
    console.log("No token found")
    return false
  }

  if (!isTokenExpired()) {
    return true // Token is still valid
  }

  console.log("Token expired, attempting refresh...")
  const refreshed = await refreshToken()

  if (!refreshed) {
    console.log("Token refresh failed, but keeping existing token for now")
    // For backward compatibility, don't remove token immediately
    return true
  }

  return true
}

// Create an authenticated fetch wrapper
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const isValid = await ensureValidToken()

  if (!isValid) {
    throw new Error("Authentication failed - please login again")
  }

  const token = getToken()
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }

  return fetch(url, { ...options, headers })
}

