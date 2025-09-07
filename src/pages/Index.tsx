"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { LeadsTable } from "@/components/LeadsTable";
import { FilterPanel } from "@/components/FilterPanel";
import { StatusBar } from "@/components/StatusBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut } from "lucide-react";
import { removeToken } from "@/utils/auth";
import { getProfile } from "@/api/auth";
import { useToast } from "@/hooks/use-toast";
import { CsvDownload } from "@/components/CsvDownload";

const Index = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadLeads();
    loadUserProfile();
  }, [currentPage, pageSize]);

  const loadUserProfile = async () => {
    try {
      const userData = await getProfile();
      setUser(userData);
    } catch (error) {
      console.error("Failed to load user profile:", error);
    }
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Mobile logout clicked");
    removeToken();
    navigate("/login");
  };

  const handleProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Mobile profile clicked");
    navigate("/profile");
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    return user.full_name || user.username || "User";
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const name = user.full_name || user.username || "User";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const loadLeads = async () => {
    setLoading(true);

    // Show loading toast
    toast({
      title: "Loading Leads",
      description: "Fetching leads from database...",
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/leads?skip=${currentPage * pageSize}&limit=${pageSize}`
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        setLeads(data);
        setFilteredLeads(data);

        // Show success toast
        toast({
          title: "Leads Loaded Successfully",
          description: `Loaded ${data.length} leads`,
        });
      } else {
        console.error("API returned non-array data:", data);
        setLeads([]);
        setFilteredLeads([]);

        // Show error toast
        toast({
          title: "Failed to Load Leads",
          description: "Invalid response format from server",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading leads:", error);
      setLeads([]);
      setFilteredLeads([]);

      // Show error toast
      toast({
        title: "Failed to Load Leads",
        description: "Unable to connect to server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (searchTerm) => {
    if (!searchTerm) {
      setFilteredLeads(leads);
      return;
    }

    const filtered = leads.filter(
      (lead) =>
        `${lead.first_name} ${lead.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.title &&
          lead.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredLeads(filtered);
  };

  const fetchNewLeads = async (filters) => {
    setLoading(true);

    toast({
      title: "Fetching New Leads",
      description: `Importing ${filters.perPage} leads from GoHighLevel...`,
    });

    try {
      const params = new URLSearchParams();
      params.append("per_page", filters.perPage.toString());

      await fetch(`${API_BASE_URL}/import/gohighlevel?${params.toString()}`);

      toast({
        title: "New Leads Imported",
        description: `Successfully fetched ${filters.perPage} new leads from GoHighLevel`,
      });

      await loadLeads();
    } catch (error) {
      console.error("Error fetching leads:", error);

      toast({
        title: "Import Failed",
        description: "Failed to fetch new leads from GoHighLevel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSpeed = async (leadId) => {
    toast({
      title: "Speed Test Started",
      description: `Refreshing speed for lead ${leadId}...`,
    });

    try {
      const response = await fetch(`${API_BASE_URL}/speedtest/${leadId}`, {
        method: "POST",
      });
      const data = await response.json();

      toast({
        title: "Speed Test Complete",
        description: data.message || `Speed test completed for lead ${leadId}`,
      });

      await loadLeads();
    } catch (error) {
      console.error("Error refreshing speed:", error);

      toast({
        title: "Speed Test Failed",
        description: `Failed to refresh speed for lead ${leadId}`,
        variant: "destructive",
      });
    }
  };

  const testAllWebsites = async () => {
    setLoading(true);

    toast({
      title: "Testing All Websites",
      description: "Running speed tests for all leads...",
    });

    try {
      const response = await fetch(`${API_BASE_URL}/speedtest`, {
        method: "POST",
      });
      const data = await response.json();

      toast({
        title: "Speed Tests Complete",
        description: data.message || "All website speed tests completed",
      });

      await loadLeads();
    } catch (error) {
      console.error("Error testing websites:", error);

      toast({
        title: "Speed Tests Failed",
        description: "Failed to test all websites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processAllPunchlines = async () => {
    setLoading(true);

    toast({
      title: "Processing Punchlines",
      description: "Generating punchlines for all leads...",
    });

    try {
      const response = await fetch(`${API_BASE_URL}/process-punchlines`, {
        method: "POST",
      });
      const data = await response.json();

      toast({
        title: "Punchlines Complete",
        description: data.message || "Punchlines processed for all leads",
      });

      await loadLeads();
    } catch (error) {
      console.error("Error processing punchlines:", error);

      toast({
        title: "Punchlines Failed",
        description: "Failed to process punchlines for all leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="md:hidden" />
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    Dashboard
                  </h1>
                  <p className="text-sm text-slate-600">
                    Welcome back to NH Outreach Agent
                  </p>
                </div>
              </div>

              {/* Mobile Profile Dropdown - Only visible on mobile when sidebar is hidden */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 rounded-full p-0"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email || "Manage your account"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleProfile}
                      className="cursor-pointer"
                      onSelect={(e) => {
                        e.preventDefault();
                        handleProfile(e as any);
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600"
                      onSelect={(e) => {
                        e.preventDefault();
                        handleLogout(e as any);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Lead Management
                </h2>
                <p className="text-slate-600 mt-1">
                  Manage and track your sales leads
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Download CSV Button */}
                <CsvDownload selectedIds={Array.from(selectedLeads)} />
              </div>
            </div>

            {/* <FilterPanel onFilter={handleFilter} onFetchLeads={fetchNewLeads} loading={loading} onCsvUploadComplete={loadLeads} /> */}

            <StatusBar message={statusMessage} />

            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <LeadsTable
                leads={filteredLeads}
                loading={loading}
                onRefreshSpeed={refreshSpeed}
                onTestAllWebsites={testAllWebsites}
                onProcessPunchlines={processAllPunchlines}
                onFetchNewLeads={fetchNewLeads}
                onFilter={handleFilter}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
              />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
