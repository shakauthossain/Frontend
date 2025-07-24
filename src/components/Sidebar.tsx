
"use client"

import type React from "react"

import { Home, Users, Mail, BarChart3, Settings, Zap, User, LogOut, ChevronUp, Linkedin } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { removeToken } from "@/utils/auth"
import { getProfile } from "@/api/auth"
import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Leads",
    url: "/dashboard",
    icon: Users,
  },
]

const campaignItems = [
  {
    title: "Email Campaigns",
    url: "/email-campaigns",
    icon: Mail,
  },
  {
    title: "LinkedIn Campaigns",
    url: "/linkedin-campaigns",
    icon: Linkedin,
    hidden: true,
  }
]

const otherItems = [
  {
    title: "Analytics",
    url: "#",
    icon: BarChart3,
    hidden: true,
  },
  {
    title: "Speed Tests",
    url: "#",
    icon: Zap,
    hidden: true,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    hidden: true,
  },
]

export function Sidebar() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userData = await getProfile()
        console.log("User data loaded:", userData) // Debug log
        setUser(userData)
      } catch (error) {
        console.error("Failed to load user profile:", error)
        // Set a default user for testing
        setUser({ username: "Test User", email: "test@example.com" })
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [])

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("Logout clicked")
    removeToken()
    navigate("/login")
  }

  const handleProfile = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("Profile clicked")
    navigate("/profile")
  }

  const getUserDisplayName = () => {
    if (!user) return "User"
    return user.full_name || user.username || "User"
  }

  const getUserInitials = () => {
    if (!user) return "U"
    const name = user.full_name || user.username || "User"
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <UISidebar className="border-r border-slate-200">
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-3">
            <img
              src="favicon.ico" // or import and use: {logo} if imported
              alt="Logo"
              className="w-7 h-7"
            />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">NH Outreach</h2>
            <p className="text-xs text-slate-500">Lead Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-600 font-medium">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-slate-100 transition-colors">
                    <a href={item.url} className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-600 font-medium">Campaigns</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {campaignItems
              .filter((item) => !item.hidden)
              .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-slate-100 transition-colors">
                    <a href={item.url} className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-600 font-medium hidden">Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {otherItems.filter((item) => !item.hidden)
                         .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-slate-100 transition-colors">
                    <a href={item.url} className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-4">
        {/* Pro Tip Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-slate-900 mb-1">Pro Tip</h3>
          <p className="text-xs text-slate-600">
            Use speed tests to identify leads with slow websites for better targeting.
          </p>
        </div>

        {/* Profile Section - Always show, even if loading */}
        <div className="border-t border-slate-200 pt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between h-auto p-3 hover:bg-slate-100 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log("Profile trigger clicked")
                }}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-slate-900">
                      {loading ? "Loading..." : getUserDisplayName()}
                    </span>
                    <span className="text-xs text-slate-500">View profile</span>
                  </div>
                </div>
                <ChevronUp className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" side="top">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email || "Manage your account"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleProfile}
                className="cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault()
                  handleProfile(e as any)
                }}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600"
                onSelect={(e) => {
                  e.preventDefault()
                  handleLogout(e as any)
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </UISidebar>
  )
}
