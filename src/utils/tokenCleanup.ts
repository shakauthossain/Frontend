import { removeToken } from "./auth"

export const clearCorruptedTokens = () => {
  try {
    const token = localStorage.getItem("access_token")
    const expiration = localStorage.getItem("token_expiration")

    // If we have invalid expiration data, clear everything
    if (expiration && isNaN(Number.parseInt(expiration))) {
      console.log("Clearing corrupted token data")
      removeToken()
      return true
    }

    return false
  } catch (error) {
    console.error("Error checking token data:", error)
    removeToken()
    return true
  }
}

