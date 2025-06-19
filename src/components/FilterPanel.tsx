
import { useState } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface FilterPanelProps {
  onFilter: (searchTerm: string) => void;
  onFetchLeads: (filters: any) => void;
  loading: boolean;
}

export function FilterPanel({ onFilter, onFetchLeads, loading }: FilterPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [industry, setIndustry] = useState('');
  const [functions, setFunctions] = useState('');
  const [seniority, setSeniority] = useState('');
  const [perPage, setPerPage] = useState('10');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onFilter(value);
  };

  const handleFetchLeads = () => {
    onFetchLeads({
      industry,
      functions,
      seniority,
      perPage: parseInt(perPage)
    });
  };

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-500" />
              <h3 className="font-medium text-slate-900">Search & Filter</h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search leads by name, email, company..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Fetch New Leads Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <h3 className="font-medium text-slate-900">Fetch New Leads</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
            </div>
            <Button 
              onClick={handleFetchLeads} 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Fetching...
                </>
              ) : (
                'Fetch New Leads'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
