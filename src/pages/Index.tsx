import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { LeadsTable } from '@/components/LeadsTable';
import { FilterPanel } from '@/components/FilterPanel';
import { StatusBar } from '@/components/StatusBar';
import { SidebarProvider } from '@/components/ui/sidebar';

const Index = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadLeads();
  }, [currentPage, pageSize]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/leads?skip=${currentPage * pageSize}&limit=${pageSize}`);
      const data = await response.json();
      
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setLeads(data);
        setFilteredLeads(data);
        setStatusMessage(`Loaded ${data.length} leads`);
      } else {
        console.error('API returned non-array data:', data);
        setLeads([]);
        setFilteredLeads([]);
        setStatusMessage('Failed to load leads - invalid response format');
      }
    } catch (error) {
      console.error('Error loading leads:', error);
      setLeads([]);
      setFilteredLeads([]);
      setStatusMessage('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (searchTerm) => {
    if (!searchTerm) {
      setFilteredLeads(leads);
      return;
    }
    
    const filtered = leads.filter(lead => 
      `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.title && lead.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredLeads(filtered);
  };

  const fetchNewLeads = async (filters) => {
    setLoading(true);
    setStatusMessage('Fetching new leads...');
    
    try {
      const params = new URLSearchParams();
      if (filters.industry) params.append("industry", filters.industry);
      if (filters.functions) params.append("functions", filters.functions);
      if (filters.seniority) params.append("seniority", filters.seniority);
      params.append("per_page", filters.perPage.toString());

      await fetch(`http://localhost:8000/import/apollo?${params.toString()}`);
      setStatusMessage(`Successfully fetched ${filters.perPage} new leads`);
      await loadLeads();
    } catch (error) {
      console.error('Error fetching leads:', error);
      setStatusMessage('Failed to fetch new leads');
    } finally {
      setLoading(false);
    }
  };

  const refreshSpeed = async (leadId) => {
    setStatusMessage(`Refreshing speed for lead ${leadId}...`);
    
    try {
      const response = await fetch(`http://localhost:8000/speedtest/${leadId}`, { method: "POST" });
      const data = await response.json();
      setStatusMessage(data.message || 'Speed test completed');
      await loadLeads();
    } catch (error) {
      console.error('Error refreshing speed:', error);
      setStatusMessage('Failed to refresh speed');
    }
  };

  const testAllWebsites = async () => {
    setLoading(true);
    setStatusMessage('Testing all websites speeds...');
    
    try {
      const response = await fetch(`http://localhost:8000/speedtest`, { method: "POST" });
      const data = await response.json();
      setStatusMessage(data.message);
      await loadLeads();
    } catch (error) {
      console.error('Error testing websites:', error);
      setStatusMessage('Failed to test all websites');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Lead Management</h1>
                <p className="text-slate-600 mt-1">Manage and track your sales leads</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={testAllWebsites}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>Test All Speeds</span>
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                </button>
              </div>
            </div>

            <FilterPanel onFilter={handleFilter} onFetchLeads={fetchNewLeads} loading={loading} />
            
            <StatusBar message={statusMessage} />

            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <LeadsTable 
                leads={filteredLeads}
                loading={loading}
                onRefreshSpeed={refreshSpeed}
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
