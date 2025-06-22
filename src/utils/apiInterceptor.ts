import { authenticatedFetch, ensureValidToken } from "@/api/auth"
import { removeToken } from "@/utils/auth"

// Create a wrapper for all API calls that need authentication
export const apiCall = async (url: string, options: RequestInit = {}) => {
  try {
    // Ensure we have a valid token before making the request
    const isValid = await ensureValidToken()

    if (!isValid) {
      throw new Error("Authentication failed")
    }

    const response = await authenticatedFetch(url, options)

    // Handle 401 responses (token might be invalid on server side)
    if (response.status === 401) {
      console.log("Received 401, removing tokens and redirecting to login")
      removeToken()
      window.location.href = "/login"
      throw new Error("Authentication failed")
    }

    return response
  } catch (error) {
    console.error("API call failed:", error)
    throw error
  }
}

// Wrapper for common API operations
export const apiGet = (url: string) => apiCall(url, { method: "GET" })
export const apiPost = (url: string, data?: any) =>
  apiCall(url, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  })
export const apiPut = (url: string, data?: any) =>
  apiCall(url, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  })
export const apiDelete = (url: string) => apiCall(url, { method: "DELETE" })

