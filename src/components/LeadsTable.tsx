
"use client"

import { useState } from "react"
import { Mail, Globe, Linkedin, Camera, ChevronLeft, ChevronRight, Gauge, RefreshCw, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
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

// Performance Meter Component
const PerformanceMeter = ({ score, type }: { score: number | undefined, type: 'web' | 'mobile' }) => {
  const safeScore = score || 0
  const circumference = 2 * Math.PI * 18 // radius of 18
  const strokeDashoffset = circumference - (safeScore / 100) * circumference
  
  const getColor = (score: number) => {
    if (score >= 90) return "#10b981" // green
    if (score >= 50) return "#f59e0b" // yellow
    return "#ef4444" // red
  }

  return (
    <div className="flex flex-col items-center space-y-1">
      <div className="relative w-10 h-10">
        <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke={getColor(safeScore)}
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-700">{safeScore}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 font-medium">{type === 'web' ? 'Web' : 'Mobile'}</span>
    </div>
  )
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
  const [linkedinFilter, setLinkedinFilter] = useState<string>("all")
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set())
  const [desktopPerformanceFilters, setDesktopPerformanceFilters] = useState<Set<string>>(new Set())
  const [mobilePerformanceFilters, setMobilePerformanceFilters] = useState<Set<string>>(new Set())
  const [filterOpen, setFilterOpen] = useState(false)

  // Safety check to ensure leads is always an array
  const safeLeads = Array.isArray(leads) ? leads : []

  // Get performance tier for desktop speed
  const getDesktopPerformanceTier = (lead: Lead) => {
    const webSpeed = lead.website_speed_web || 0
    
    if (webSpeed >= 90) return "90+"
    if (webSpeed >= 50) return "50-89"
    return "below-50"
  }

  // Get performance tier for mobile speed
  const getMobilePerformanceTier = (lead: Lead) => {
    const mobileSpeed = lead.website_speed_mobile || 0
    
    if (mobileSpeed >= 90) return "90+"
    if (mobileSpeed >= 50) return "50-89"
    return "below-50"
  }

  // Filter leads based on LinkedIn URL filter and performance filters
  const filteredLeads = safeLeads.filter(lead => {
    // LinkedIn filter
    let passesLinkedInFilter = true
    if (linkedinFilter === "with-linkedin") {
      passesLinkedInFilter = lead.linkedin_url && lead.linkedin_url.trim() !== ""
    } else if (linkedinFilter === "without-linkedin") {
      passesLinkedInFilter = !lead.linkedin_url || lead.linkedin_url.trim() === ""
    }

    // Desktop performance filter
    let passesDesktopPerformanceFilter = true
    if (desktopPerformanceFilters.size > 0) {
      const tier = getDesktopPerformanceTier(lead)
      passesDesktopPerformanceFilter = desktopPerformanceFilters.has(tier)
    }

    // Mobile performance filter
    let passesMobilePerformanceFilter = true
    if (mobilePerformanceFilters.size > 0) {
      const tier = getMobilePerformanceTier(lead)
      passesMobilePerformanceFilter = mobilePerformanceFilters.has(tier)
    }

    return passesLinkedInFilter && passesDesktopPerformanceFilter && passesMobilePerformanceFilter
  })

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

  const handleSelectLead = (leadId: number, checked: boolean) => {
    const newSelected = new Set(selectedLeads)
    if (checked) {
      newSelected.add(leadId)
    } else {
      newSelected.delete(leadId)
    }
    setSelectedLeads(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead.id)))
    } else {
      setSelectedLeads(new Set())
    }
  }

  const handleDesktopPerformanceFilterChange = (tier: string, checked: boolean) => {
    const newFilters = new Set(desktopPerformanceFilters)
    if (checked) {
      newFilters.add(tier)
    } else {
      newFilters.delete(tier)
    }
    setDesktopPerformanceFilters(newFilters)
  }

  const handleMobilePerformanceFilterChange = (tier: string, checked: boolean) => {
    const newFilters = new Set(mobilePerformanceFilters)
    if (checked) {
      newFilters.add(tier)
    } else {
      newFilters.delete(tier)
    }
    setMobilePerformanceFilters(newFilters)
  }

  const isAllSelected = filteredLeads.length > 0 && selectedLeads.size === filteredLeads.length
  const isIndeterminate = selectedLeads.size > 0 && selectedLeads.size < filteredLeads.length

  const handleSendMail = () => {
    console.log("Send mail to selected leads:", Array.from(selectedLeads))
    // Add your mail sending logic here
  }

  const handleSendLinkedIn = () => {
    console.log("Send LinkedIn message to selected leads:", Array.from(selectedLeads))
    // Add your LinkedIn messaging logic here
  }

  // Check if we should show Send Mail button
  const shouldShowSendMail = linkedinFilter === "all" || linkedinFilter === "without-linkedin"
  
  // Check if we should show Send LinkedIn button
  const shouldShowSendLinkedIn = linkedinFilter === "all" || linkedinFilter === "with-linkedin"

  if (loading && filteredLeads.length === 0) {
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
      {/* Header with filters */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-slate-900">Leads ({filteredLeads.length})</h2>
        </div>

        <div className="flex items-center space-x-4">
          {selectedLeads.size > 0 && (
            <>
              {shouldShowSendMail && (
                <Button
                  onClick={handleSendMail}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Mail ({selectedLeads.size})
                </Button>
              )}
              {shouldShowSendLinkedIn && (
                <Button
                  onClick={handleSendLinkedIn}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  Send LinkedIn ({selectedLeads.size})
                </Button>
              )}
            </>
          )}
          
          {/* Filter Sheet */}
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Lead Filtering Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-900">Lead Filtering</h3>
                  <div>
                    <label className="text-sm text-slate-600 mb-2 block">LinkedIn Status</label>
                    <Select value={linkedinFilter} onValueChange={setLinkedinFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Leads</SelectItem>
                        <SelectItem value="with-linkedin">With LinkedIn URL</SelectItem>
                        <SelectItem value="without-linkedin">Without LinkedIn URL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Desktop Performance Filtering Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-900">Desktop Performance</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={desktopPerformanceFilters.has("90+")}
                        onCheckedChange={(checked) => handleDesktopPerformanceFilterChange("90+", checked as boolean)}
                      />
                      <span className="text-sm text-green-600 font-medium">90+ Performance</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={desktopPerformanceFilters.has("50-89")}
                        onCheckedChange={(checked) => handleDesktopPerformanceFilterChange("50-89", checked as boolean)}
                      />
                      <span className="text-sm text-yellow-600 font-medium">50-89 Performance</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={desktopPerformanceFilters.has("below-50")}
                        onCheckedChange={(checked) => handleDesktopPerformanceFilterChange("below-50", checked as boolean)}
                      />
                      <span className="text-sm text-red-600 font-medium">Below 50 Performance</span>
                    </label>
                  </div>
                </div>

                {/* Mobile Performance Filtering Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-900">Mobile Performance</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={mobilePerformanceFilters.has("90+")}
                        onCheckedChange={(checked) => handleMobilePerformanceFilterChange("90+", checked as boolean)}
                      />
                      <span className="text-sm text-green-600 font-medium">90+ Performance</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={mobilePerformanceFilters.has("50-89")}
                        onCheckedChange={(checked) => handleMobilePerformanceFilterChange("50-89", checked as boolean)}
                      />
                      <span className="text-sm text-yellow-600 font-medium">50-89 Performance</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={mobilePerformanceFilters.has("below-50")}
                        onCheckedChange={(checked) => handleMobilePerformanceFilterChange("below-50", checked as boolean)}
                      />
                      <span className="text-sm text-red-600 font-medium">Below 50 Performance</span>
                    </label>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left p-4 font-medium text-slate-700">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className={isIndeterminate ? "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground" : ""}
                />
              </th>
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
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <Checkbox
                    checked={selectedLeads.has(lead.id)}
                    onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                  />
                </td>

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
                  <div className="flex flex-col items-center space-y-2">
                    {/* Performance Meters */}
                    <div className="flex space-x-3">
                      <PerformanceMeter score={lead.website_speed_web} type="web" />
                      <PerformanceMeter score={lead.website_speed_mobile} type="mobile" />
                    </div>
                    
                    {/* Speed Test Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSpeedPageNavigation(lead.id)}
                      title="View Speed Details"
                      className="h-8 px-3 rounded-full bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 border border-orange-200 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Gauge className="w-3 h-3 mr-1 text-orange-600" />
                      <span className="text-orange-700 font-medium text-xs">Speed Test</span>
                    </Button>
                  </div>
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

      {/* Pagination moved to bottom */}
      <div className="flex items-center justify-between p-6 border-t border-slate-200">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-slate-600">
            Showing {filteredLeads.length} of {safeLeads.length} total leads
          </div>
          
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
            disabled={filteredLeads.length < pageSize}
            className="hover:bg-slate-50 transition-all duration-200"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {filteredLeads.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-slate-500 text-lg mb-2">No leads found</div>
          <div className="text-slate-400 text-sm">Try adjusting your filters or fetching some new leads</div>
        </div>
      )}
    </div>
  )
}
