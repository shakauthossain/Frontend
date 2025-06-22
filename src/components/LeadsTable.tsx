
"use client"

import { useState } from "react"
import { Mail, Globe, Linkedin, Camera, ChevronLeft, ChevronRight, Gauge, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNavigate } from "react-router-dom"

interface Lead {
  id: number
  first_name: string
  last_name: string
  email: string
  title?: string
  company: string
  website_url?: string
  linkedin_url?: string
  website_speed_web?: number
  website_speed_mobile?: number
  screenshot_url?: string
  mail_sent: boolean
}

interface LeadsTableProps {
  leads: Lead[]
  loading: boolean
  onRefreshSpeed: (leadId: number) => void
  currentPage: number
  setCurrentPage: (page: number) => void
  pageSize: number
  setPageSize: (size: number) => void
}

export function LeadsTable({
  leads,
  loading,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
}: LeadsTableProps) {
  const navigate = useNavigate()

  // Safety check to ensure leads is always an array
  const safeLeads = Array.isArray(leads) ? leads : []

  const handleSpeedPageNavigation = (leadId: number) => {
    navigate(`/speed/${leadId}`)
  }

  const getMailStatusIcon = (mailSent: boolean) => {
    return mailSent ? (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 border border-green-200">
        <Mail className="w-4 h-4 text-green-600" />
      </div>
    ) : (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border border-gray-200">
        <Mail className="w-4 h-4 text-gray-400" />
      </div>
    )
  }

  if (loading && safeLeads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-slate-600">Loading leads...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with pagination controls */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-slate-900">Leads ({safeLeads.length})</h2>
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number.parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="hover:bg-slate-50 transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </Button>
          <span className="text-sm text-slate-600 px-3">Page {currentPage + 1}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={safeLeads.length < pageSize}
            className="hover:bg-slate-50 transition-all duration-200"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left p-4 font-medium text-slate-700">Lead</th>
              <th className="text-left p-4 font-medium text-slate-700">Contact</th>
              <th className="text-left p-4 font-medium text-slate-700">Company</th>
              <th className="text-left p-4 font-medium text-slate-700">Links</th>
              <th className="text-left p-4 font-medium text-slate-700">Website Speed</th>
              <th className="text-left p-4 font-medium text-slate-700">Actions</th>
              <th className="text-left p-4 font-medium text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {safeLeads.map((lead) => (
              <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-slate-900">
                    {lead.first_name} {lead.last_name}
                  </div>
                </td>

                <td className="p-4">
                  <div className="space-y-1">
                    <div className="text-sm text-slate-900">
                      {lead.email.includes("locked_") ? <Badge variant="secondary">Locked Email</Badge> : lead.email}
                    </div>
                    <div className="text-sm text-slate-500">{lead.title || "N/A"}</div>
                  </div>
                </td>

                <td className="p-4">
                  <div className="font-medium text-slate-900">{lead.company}</div>
                </td>

                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    {lead.website_url && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild
                        className="h-9 w-9 p-0 rounded-full hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200"
                      >
                        <a href={lead.website_url} target="_blank" rel="noopener noreferrer" title="Visit Website">
                          <Globe className="w-4 h-4 text-blue-600" />
                        </a>
                      </Button>
                    )}
                    {lead.linkedin_url && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild
                        className="h-9 w-9 p-0 rounded-full hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200"
                      >
                        <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" title="View LinkedIn">
                          <Linkedin className="w-4 h-4 text-blue-600" />
                        </a>
                      </Button>
                    )}
                    {lead.screenshot_url && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild
                        className="h-9 w-9 p-0 rounded-full hover:bg-purple-50 hover:border-purple-200 border border-transparent transition-all duration-200"
                      >
                        <a href={lead.screenshot_url} target="_blank" rel="noopener noreferrer" title="View Screenshot">
                          <Camera className="w-4 h-4 text-purple-600" />
                        </a>
                      </Button>
                    )}
                  </div>
                </td>

                <td className="p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSpeedPageNavigation(lead.id)}
                    title="View Speed Details"
                    className="h-9 px-3 rounded-full bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 border border-orange-200 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Gauge className="w-4 h-4 mr-2 text-orange-600" />
                    <span className="text-orange-700 font-medium">Speed Test</span>
                  </Button>
                </td>

                <td className="p-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild 
                    title="Open Mail Panel"
                    className="h-9 w-9 p-0 rounded-full hover:bg-green-50 hover:border-green-200 border border-transparent transition-all duration-200"
                  >
                    <a href={`/mail/${lead.id}`}>
                      <Mail className="w-4 h-4 text-green-600" />
                    </a>
                  </Button>
                </td>

                <td className="p-4">
                  <div title={lead.mail_sent ? "Mail Sent" : "No Mail Sent"}>
                    {getMailStatusIcon(lead.mail_sent)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {safeLeads.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-slate-500 text-lg mb-2">No leads found</div>
          <div className="text-slate-400 text-sm">Try fetching some new leads or adjusting your search filters</div>
        </div>
      )}
    </div>
  )
}
