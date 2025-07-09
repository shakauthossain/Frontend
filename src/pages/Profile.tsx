"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getProfile, testBackendConnection } from "../api/auth"
import { removeToken } from "../utils/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Phone, Building, Briefcase, LogOut, ArrowLeft, AlertCircle, Server } from "lucide-react"
import { useTokenMonitor } from "@/hooks/useTokenMonitor"

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [backendStatus, setBackendStatus] = useState<boolean | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  // Only monitor token if we have a user loaded
  useTokenMonitor(!!user)

  useEffect(() => {
    console.log("Profile component mounted")
    checkBackendAndLoadProfile()
  }, [])

  const checkBackendAndLoadProfile = async () => {
    console.log("Checking backend connection...")
    setIsLoading(true)
    setError(null)

    // First test if backend is reachable
    const isBackendUp = await testBackendConnection()
    setBackendStatus(isBackendUp)

    if (!isBackendUp) {
      setError("Backend server is not reachable. Please ensure your backend is running on port 8000.")
      setIsLoading(false)
      return
    }

    // If backend is up, try to load profile
    await loadProfile()
  }

  const loadProfile = async () => {
    console.log("Loading profile...")

    try {
      const token = localStorage.getItem("access_token")
      console.log("Token exists:", !!token)

      if (!token) {
        console.log("No token found in Profile component")
        toast({
          title: "Authentication Required",
          description: "Please sign in to view your profile.",
          variant: "destructive",
        })
        navigate("/login")
        return
      }

      const userData = await getProfile()
      console.log("Profile data loaded:", userData)
      setUser(userData)
      setError(null)
    } catch (error: any) {
      console.error("Profile loading error:", error)
      setError(error.message || "Failed to load profile")

      if (error.message?.includes("401") || error.message?.includes("Authentication failed")) {
        toast({
          title: "Session Expired",
          description: "Please sign in again to view your profile.",
          variant: "destructive",
        })
        removeToken()
        navigate("/login")
      } else {
        toast({
          title: "Error Loading Profile",
          description: error.message || "Failed to load profile data.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    console.log("Logout from profile page")
    removeToken()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
    navigate("/login")
  }

  const handleBackToDashboard = () => {
    console.log("Navigating back to dashboard")
    navigate("/dashboard")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-600">Loading profile...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 mb-4">
              {backendStatus === false ? (
                <Server className="w-12 h-12 mx-auto mb-2" />
              ) : (
                <AlertCircle className="w-12 h-12 mx-auto mb-2" />
              )}
              <h2 className="text-lg font-semibold">
                {backendStatus === false ? "Backend Server Error" : "Profile Error"}
              </h2>
              <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{error}</p>
            </div>
            <div className="space-y-2">
              <Button onClick={checkBackendAndLoadProfile} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={handleBackToDashboard} className="w-full">
                Back to Dashboard
              </Button>
            </div>
            {backendStatus === false && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                <h3 className="text-sm font-medium text-yellow-800 mb-1">Troubleshooting:</h3>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Check if your backend server is running</li>
                  <li>• Verify it's running on port 8000</li>
                  <li>• Check for any backend errors in the console</li>
                  <li>• Ensure the /profile endpoint exists</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 mb-2">No Profile Data</h2>
            <p className="text-sm text-slate-600 mb-4">Unable to load your profile information.</p>
            <Button onClick={handleBackToDashboard} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const profileFields = [
    { key: "username", label: "Username", icon: User },
    { key: "full_name", label: "Full Name", icon: User },
    { key: "email", label: "Email", icon: Mail },
    { key: "phone", label: "Phone", icon: Phone },
    { key: "company", label: "Company", icon: Building },
    { key: "position", label: "Position", icon: Briefcase },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={handleBackToDashboard} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">{user.full_name || user.username}</CardTitle>
            <CardDescription className="text-slate-600">
              {user.position && user.company ? `${user.position} at ${user.company}` : "User Profile"}
            </CardDescription>
            <Badge variant="secondary" className="w-fit mx-auto mt-2">
              Active User
            </Badge>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Profile Information</h3>
                <div className="grid gap-4">
                  {profileFields.map(({ key, label, icon: Icon }) => {
                    const value = user[key]
                    if (!value) return null

                    return (
                      <div key={key} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <Icon className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-700">{label}</div>
                          <div className="text-slate-900">{value}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Additional user data */}
              {Object.entries(user).some(
                ([key]) => !profileFields.some((field) => field.key === key) && key !== "id",
              ) && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Additional Information</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {Object.entries(user).map(([key, value]) => {
                        if (profileFields.some((field) => field.key === key) || key === "id" || !value) return null

                        return (
                          <div key={key} className="flex justify-between items-center py-1">
                            <span className="text-sm font-medium text-slate-700 capitalize">
                              {key.replace(/_/g, " ")}:
                            </span>
                            <span className="text-slate-900 text-sm">{String(value)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

