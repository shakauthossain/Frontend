"use client";

import { useState } from "react";
import {
  Mail,
  Globe,
  Linkedin,
  Camera,
  ChevronLeft,
  ChevronRight,
  Gauge,
  RefreshCw,
  Filter,
  Search,
  Download,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { CsvUpload } from "@/components/CsvUpload";
import { CsvDownload } from "@/components/CsvDownload";

interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  title?: string;
  company: string;
  website_url?: string;
  linkedin_url?: string;
  website_speed_web?: number;
  website_speed_mobile?: number;
  screenshot_url_web?: string;
  mail_sent: boolean;
}

interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
  onRefreshSpeed: (leadId: number) => void;
  onTestAllWebsites: () => void;
  onProcessPunchlines: () => void;
  onFetchNewLeads: (filters: any) => void;
  onFilter: (searchTerm: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
}

// Performance Meter Component
const PerformanceMeter = ({
  score,
  type,
}: {
  score: number | undefined;
  type: "web" | "mobile";
}) => {
  const safeScore = score || 0;
  const circumference = 2 * Math.PI * 18; // radius of 18
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 90) return "#10b981"; // green
    if (score >= 50) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

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
      <span className="text-xs text-gray-500 font-medium">
        {type === "web" ? "Web" : "Mobile"}
      </span>
    </div>
  );
};

export function LeadsTable({
  leads,
  loading,
  onTestAllWebsites,
  onProcessPunchlines,
  onFetchNewLeads,
  onFilter,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
}: LeadsTableProps) {
  const navigate = useNavigate();
  const [linkedinFilter, setLinkedinFilter] = useState<string>("all");
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [desktopPerformanceFilters, setDesktopPerformanceFilters] = useState<
    Set<string>
  >(new Set());
  const [mobilePerformanceFilters, setMobilePerformanceFilters] = useState<
    Set<string>
  >(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [fetchLeadsOpen, setFetchLeadsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [industry, setIndustry] = useState("");
  const [functions, setFunctions] = useState("");
  const [seniority, setSeniority] = useState("");
  const [perPage, setPerPage] = useState("10");
  const [csvUploadOpen, setCsvUploadOpen] = useState(false);

  // Safety check to ensure leads is always an array
  const safeLeads = Array.isArray(leads) ? leads : [];

  // Get performance tier for desktop speed
  const getDesktopPerformanceTier = (lead: Lead) => {
    const webSpeed = lead.website_speed_web || 0;

    if (webSpeed >= 90) return "90+";
    if (webSpeed >= 50) return "50-89";
    return "below-50";
  };

  // Get performance tier for mobile speed
  const getMobilePerformanceTier = (lead: Lead) => {
    const mobileSpeed = lead.website_speed_mobile || 0;

    if (mobileSpeed >= 90) return "90+";
    if (mobileSpeed >= 50) return "50-89";
    return "below-50";
  };

  // Filter leads based on LinkedIn URL filter and performance filters
  const filteredLeads = safeLeads.filter((lead) => {
    // LinkedIn filter
    let passesLinkedInFilter = true;
    if (linkedinFilter === "with-linkedin") {
      passesLinkedInFilter =
        lead.linkedin_url && lead.linkedin_url.trim() !== "";
    } else if (linkedinFilter === "without-linkedin") {
      passesLinkedInFilter =
        !lead.linkedin_url || lead.linkedin_url.trim() === "";
    }

    // Desktop performance filter
    let passesDesktopPerformanceFilter = true;
    if (desktopPerformanceFilters.size > 0) {
      const tier = getDesktopPerformanceTier(lead);
      passesDesktopPerformanceFilter = desktopPerformanceFilters.has(tier);
    }

    // Mobile performance filter
    let passesMobilePerformanceFilter = true;
    if (mobilePerformanceFilters.size > 0) {
      const tier = getMobilePerformanceTier(lead);
      passesMobilePerformanceFilter = mobilePerformanceFilters.has(tier);
    }

    return (
      passesLinkedInFilter &&
      passesDesktopPerformanceFilter &&
      passesMobilePerformanceFilter
    );
  });

  const handleSpeedPageNavigation = (leadId: number) => {
    navigate(`/speed/${leadId}`);
  };

  const getMailStatusIcon = (mailSent: boolean) => {
    return mailSent ? (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-200 border border-green-200">
        <Mail className="w-4 h-4 text-green-900" />
      </div>
    ) : (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 border border-gray-200">
        <Mail className="w-4 h-4 text-red-900" />
      </div>
    );
  };

  const handleSelectLead = (leadId: number, checked: boolean) => {
    const newSelected = new Set(selectedLeads);
    if (checked) {
      newSelected.add(leadId);
    } else {
      newSelected.delete(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(filteredLeads.map((lead) => lead.id)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleDesktopPerformanceFilterChange = (
    tier: string,
    checked: boolean
  ) => {
    const newFilters = new Set(desktopPerformanceFilters);
    if (checked) {
      newFilters.add(tier);
    } else {
      newFilters.delete(tier);
    }
    setDesktopPerformanceFilters(newFilters);
  };

  const handleMobilePerformanceFilterChange = (
    tier: string,
    checked: boolean
  ) => {
    const newFilters = new Set(mobilePerformanceFilters);
    if (checked) {
      newFilters.add(tier);
    } else {
      newFilters.delete(tier);
    }
    setMobilePerformanceFilters(newFilters);
  };

  const isAllSelected =
    filteredLeads.length > 0 && selectedLeads.size === filteredLeads.length;
  const isIndeterminate =
    selectedLeads.size > 0 && selectedLeads.size < filteredLeads.length;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onFilter(value);
  };

  const handleFetchLeads = () => {
    onFetchNewLeads({
      industry,
      functions,
      seniority,
      perPage: parseInt(perPage),
    });
    setFetchLeadsOpen(false);
  };

  const handleSendMail = () => {
    console.log("Send mail to selected leads:", Array.from(selectedLeads));
  };

  const handleSendLinkedIn = () => {
    console.log(
      "Send LinkedIn message to selected leads:",
      Array.from(selectedLeads)
    );
  };

  // Check if we should show Send Mail button
  const shouldShowSendMail =
    linkedinFilter === "all" || linkedinFilter === "without-linkedin";

  // Check if we should show Send LinkedIn button
  const shouldShowSendLinkedIn =
    linkedinFilter === "all" || linkedinFilter === "with-linkedin";

  if (loading && filteredLeads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-slate-600">Loading leads...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Leads ({filteredLeads.length})
          </h2>
          <div className="flex items-center space-x-2">
            {/* Process Punchlines Button */}
            <Button
              onClick={onProcessPunchlines}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>Process Punchlines</span>
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-1"></div>
              )}
            </Button>

            {/* Test All Speeds Button */}
            <Button
              onClick={onTestAllWebsites}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
            >
              <Gauge className="w-4 h-4" />
              <span>Test All Speeds</span>
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-1"></div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between px-6 border-y border-slate-200 py-3">
        <div className="flex items-center space-x-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* CSV Upload Dialog */}
          <Dialog open={csvUploadOpen} onOpenChange={setCsvUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" /> Upload CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="w-96">
              <DialogHeader>
                <DialogTitle>Upload CSV Leads</DialogTitle>
              </DialogHeader>
              <CsvUpload 
                onUploadComplete={() => {
                  setCsvUploadOpen(false);
                  // You can add refresh logic here if needed
                }} 
              />
            </DialogContent>
          </Dialog>

          {/* CSV Download */}
          <CsvDownload selectedIds={Array.from(selectedLeads)} />

          {/* Fetch New Leads Dialog */}
          <Dialog open={fetchLeadsOpen} onOpenChange={setFetchLeadsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-6 h-6" /> Fetch Leads
              </Button>
            </DialogTrigger>
            <DialogContent className="w-96">
              <DialogHeader>
                <DialogTitle>Fetch New Leads</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Industry (e.g., Software)"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
                <Input
                  placeholder="Function (e.g., Marketing)"
                  value={functions}
                  onChange={(e) => setFunctions(e.target.value)}
                />
                <Input
                  placeholder="Seniority (e.g., VP)"
                  value={seniority}
                  onChange={(e) => setSeniority(e.target.value)}
                />
                <Select value={perPage} onValueChange={setPerPage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 Leads</SelectItem>
                    <SelectItem value="25">25 Leads</SelectItem>
                    <SelectItem value="50">50 Leads</SelectItem>
                    <SelectItem value="100">100 Leads</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleFetchLeads} className="w-full">
                  Fetch New Leads
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white hidden"
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
                <Filter className="w-4 h-4" /> Filter
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Lead Filtering Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-900">
                    Lead Filtering
                  </h3>
                  <div>
                    <label className="text-sm text-slate-600 mb-2 block">
                      LinkedIn Status
                    </label>
                    <Select
                      value={linkedinFilter}
                      onValueChange={setLinkedinFilter}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Leads</SelectItem>
                        <SelectItem value="with-linkedin">
                          With LinkedIn URL
                        </SelectItem>
                        <SelectItem value="without-linkedin">
                          Without LinkedIn URL
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Desktop Performance Filtering Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-900">
                    Desktop Performance
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={desktopPerformanceFilters.has("90+")}
                        onCheckedChange={(checked) =>
                          handleDesktopPerformanceFilterChange(
                            "90+",
                            checked as boolean
                          )
                        }
                      />
                      <span className="text-sm text-green-600 font-medium">
                        90+ Performance
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={desktopPerformanceFilters.has("50-89")}
                        onCheckedChange={(checked) =>
                          handleDesktopPerformanceFilterChange(
                            "50-89",
                            checked as boolean
                          )
                        }
                      />
                      <span className="text-sm text-yellow-600 font-medium">
                        50-89 Performance
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={desktopPerformanceFilters.has("below-50")}
                        onCheckedChange={(checked) =>
                          handleDesktopPerformanceFilterChange(
                            "below-50",
                            checked as boolean
                          )
                        }
                      />
                      <span className="text-sm text-red-600 font-medium">
                        Below 50 Performance
                      </span>
                    </label>
                  </div>
                </div>

                {/* Mobile Performance Filtering Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-900">
                    Mobile Performance
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={mobilePerformanceFilters.has("90+")}
                        onCheckedChange={(checked) =>
                          handleMobilePerformanceFilterChange(
                            "90+",
                            checked as boolean
                          )
                        }
                      />
                      <span className="text-sm text-green-600 font-medium">
                        90+ Performance
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={mobilePerformanceFilters.has("50-89")}
                        onCheckedChange={(checked) =>
                          handleMobilePerformanceFilterChange(
                            "50-89",
                            checked as boolean
                          )
                        }
                      />
                      <span className="text-sm text-yellow-600 font-medium">
                        50-89 Performance
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={mobilePerformanceFilters.has("below-50")}
                        onCheckedChange={(checked) =>
                          handleMobilePerformanceFilterChange(
                            "below-50",
                            checked as boolean
                          )
                        }
                      />
                      <span className="text-sm text-red-600 font-medium">
                        Below 50 Performance
                      </span>
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
                  className={
                    isIndeterminate
                      ? "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
                      : ""
                  }
                />
              </th>
              <th className="text-left p-4 font-medium text-slate-700">Lead</th>
              <th className="text-left p-4 font-medium text-slate-700">
                Contact
              </th>
              <th className="text-left p-4 font-medium text-slate-700">
                Company
              </th>
              <th className="text-left p-4 font-medium text-slate-700">
                Links
              </th>
              <th className="text-left p-4 font-medium text-slate-700">
                Website Speed
              </th>
              <th className="text-left p-4 font-medium text-slate-700">
                Actions
              </th>
              <th className="text-left p-4 font-medium text-slate-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="p-4">
                  <Checkbox
                    checked={selectedLeads.has(lead.id)}
                    onCheckedChange={(checked) =>
                      handleSelectLead(lead.id, checked as boolean)
                    }
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
                      {lead.email.includes("locked_") ? (
                        <Badge variant="secondary">Locked Email</Badge>
                      ) : (
                        lead.email
                      )}
                    </div>
                    <div className="text-sm text-slate-500">
                      {lead.title || "N/A"}
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  <div className="font-medium text-slate-900">
                    {lead.company}
                  </div>
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
                        <a
                          href={lead.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Visit Website"
                        >
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
                        <a
                          href={lead.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View LinkedIn"
                        >
                          <Linkedin className="w-4 h-4 text-blue-600" />
                        </a>
                      </Button>
                    )}
                    {lead.screenshot_url_web && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-9 w-9 p-0 rounded-full hover:bg-purple-50 hover:border-purple-200 border border-transparent transition-all duration-200"
                      >
                        <a
                          href={`${lead.screenshot_url_web}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View Screenshot"
                        >
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
                      <PerformanceMeter
                        score={lead.website_speed_web}
                        type="web"
                      />
                      <PerformanceMeter
                        score={lead.website_speed_mobile}
                        type="mobile"
                      />
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
                      <span className="text-orange-700 font-medium text-xs">
                        Speed Test
                      </span>
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

          <Select
            value={pageSize.toString()}
            onValueChange={(value) => setPageSize(Number.parseInt(value))}
          >
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
          <span className="text-sm text-slate-600 px-3">
            Page {currentPage + 1}
          </span>
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
          <div className="text-slate-400 text-sm">
            Try adjusting your filters or fetching some new leads
          </div>
        </div>
      )}
    </div>
  );
}
