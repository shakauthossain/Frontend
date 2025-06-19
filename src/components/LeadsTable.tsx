import { useState } from 'react';
import { ExternalLink, Mail, RefreshCw, Globe, Linkedin, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  screenshot_url?: string;
  mail_sent: boolean;
}

interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
  onRefreshSpeed: (leadId: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
}

export function LeadsTable({ 
  leads, 
  loading, 
  onRefreshSpeed, 
  currentPage, 
  setCurrentPage, 
  pageSize, 
  setPageSize 
}: LeadsTableProps) {
  const [refreshingSpeedId, setRefreshingSpeedId] = useState<number | null>(null);

  // Safety check to ensure leads is always an array
  const safeLeads = Array.isArray(leads) ? leads : [];

  const handleRefreshSpeed = async (leadId: number) => {
    setRefreshingSpeedId(leadId);
    await onRefreshSpeed(leadId);
    setRefreshingSpeedId(null);
  };

  const getSpeedBadge = (webSpeed: number | null, mobileSpeed: number | null) => {
    if (webSpeed === null || webSpeed === undefined) {
      return <Badge variant="secondary">Not Tested</Badge>;
    }
    
    const isGood = webSpeed > 80;
    return (
      <Badge variant={isGood ? "default" : "destructive"} className={isGood ? "bg-green-100 text-green-800" : ""}>
        Web: {webSpeed} / Mobile: {mobileSpeed || 'N/A'}
      </Badge>
    );
  };

  const getMailStatusBadge = (mailSent: boolean) => {
    return mailSent ? (
      <Badge className="bg-green-100 text-green-800">Mail Sent</Badge>
    ) : (
      <Badge variant="secondary">No Mail</Badge>
    );
  };

  if (loading && safeLeads.length === 0) {
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
    <div className="space-y-4">
      {/* Header with pagination controls */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-slate-900">Leads ({safeLeads.length})</h2>
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
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
            disabled={safeLeads.length < pageSize}
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
                  <div className="space-y-1">
                    <div className="font-medium text-slate-900">
                      {lead.first_name} {lead.last_name}
                    </div>
                    <div className="text-sm text-slate-500">ID: {lead.id}</div>
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
                    <div className="text-sm text-slate-500">{lead.title || 'N/A'}</div>
                  </div>
                </td>
                
                <td className="p-4">
                  <div className="font-medium text-slate-900">{lead.company}</div>
                </td>
                
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    {lead.website_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={lead.website_url} target="_blank" rel="noopener noreferrer">
                          <Globe className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    {lead.linkedin_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    {lead.screenshot_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={lead.screenshot_url} target="_blank" rel="noopener noreferrer">
                          <Camera className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </td>
                
                <td className="p-4">
                  <div className="space-y-2">
                    {getSpeedBadge(lead.website_speed_web, lead.website_speed_mobile)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefreshSpeed(lead.id)}
                      disabled={refreshingSpeedId === lead.id}
                      className="w-full"
                    >
                      {refreshingSpeedId === lead.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        'Refresh'
                      )}
                    </Button>
                  </div>
                </td>
                
                <td className="p-4">
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={`/mail/${lead.id}`}
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Mail Panel
                    </a>
                  </Button>
                </td>
                
                <td className="p-4">
                  {getMailStatusBadge(lead.mail_sent)}
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
  );
}
