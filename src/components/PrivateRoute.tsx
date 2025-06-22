"use client"

import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import type React from "react"
import { removeToken, getToken, isTokenExpired } from "@/utils/auth"

interface PrivateRouteProps {
  children: React.ReactNode
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuthentication = async () => {
      console.log("PrivateRoute: Checking authentication...")

      try {
        const token = getToken()

        if (!token) {
          console.log("PrivateRoute: No token found")
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }

        // For now, just check if token exists and is not expired
        // We can make this more strict later
        if (isTokenExpired()) {
          console.log("PrivateRoute: Token expired")
          removeToken()
          setIsAuthenticated(false)
        } else {
          console.log("PrivateRoute: Token valid")
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("PrivateRoute: Authentication check failed:", error)
        setIsAuthenticated(true) // Be lenient for now
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthentication()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-600">Verifying authentication...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log("PrivateRoute: Redirecting to login")
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default PrivateRoute

