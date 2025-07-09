"use client"

import { useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { isTokenValid, getTokenExpirationTime, removeToken } from "@/utils/auth"
import { useToast } from "@/hooks/use-toast"
import { getToken } from "@/utils/auth"

export const useTokenMonitor = (enabled = true) => {
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleTokenExpiration = useCallback(() => {
    console.log("Token expired, logging out user")
    removeToken()
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please sign in again.",
      variant: "destructive",
    })
    navigate("/login")
  }, [navigate, toast])

  useEffect(() => {
    if (!enabled) return

    const checkTokenExpiration = () => {
      const token = getToken()
      if (!token) return // No token, no need to monitor

      if (!isTokenValid()) {
        handleTokenExpiration()
        return
      }

      const expirationTime = getTokenExpirationTime()
      if (expirationTime) {
        const timeUntilExpiration = expirationTime.getTime() - Date.now()

        // Show warning 5 minutes before expiration
        const warningTime = timeUntilExpiration - 5 * 60 * 1000

        if (warningTime > 0 && warningTime < 24 * 60 * 60 * 1000) {
          // Only if less than 24 hours
          setTimeout(() => {
            toast({
              title: "Session Expiring Soon",
              description: "Your session will expire in 5 minutes. Please save your work.",
              variant: "default",
            })
          }, warningTime)
        }

        // Auto logout at expiration (only if reasonable time)
        if (timeUntilExpiration > 0 && timeUntilExpiration < 24 * 60 * 60 * 1000) {
          setTimeout(() => {
            handleTokenExpiration()
          }, timeUntilExpiration)
        }
      }
    }

    // Check immediately
    checkTokenExpiration()

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000)

    return () => clearInterval(interval)
  }, [handleTokenExpiration, toast, enabled])
}

