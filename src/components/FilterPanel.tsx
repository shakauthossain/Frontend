import { useState } from 'react';
import { Search, Filter, RefreshCw, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CsvUpload } from './CsvUpload';
import { CsvDownload } from './CsvDownload';

interface FilterPanelProps {
  onFilter: (searchTerm: string) => void;
  onFetchLeads: (filters: any) => void;
  loading: boolean;
  onCsvUploadComplete?: () => void;
  selectedIds?: number[];
}

export function FilterPanel({ onFilter, onFetchLeads, loading, onCsvUploadComplete, selectedIds }: FilterPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [industry, setIndustry] = useState('');
  const [functions, setFunctions] = useState('');
  const [seniority, setSeniority] = useState('');
  const [perPage, setPerPage] = useState('10');
  const [csvUploadOpen, setCsvUploadOpen] = useState(false);

  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [leads, setLeads] = useState<any[]>([]); // Replace `any` with your Lead type if available

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onFilter(value);
  };

  const handleFetchLeads = async () => {
    onFetchLeads({
      industry,
      functions,
      seniority,
      perPage: parseInt(perPage)
    });

    if (!hasMore || isFetching) return;

    setIsFetching(true);
    try {
      const response = await fetch(`/leads?skip=${skip}&limit=${limit}`);
      const data = await response.json();

      if (data.length < limit) {
        setHasMore(false);
      }

      setLeads((prev) => [...prev, ...data]);
      setSkip((prev) => prev + limit);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setIsFetching(false);
    }
  };

  const handlePerPageChange = (value: string) => {
    const newLimit = parseInt(value);
    setPerPage(value);
    setLimit(newLimit);
    setSkip(0);
    setLeads([]);
    setHasMore(true);
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
              <Select value={perPage} onValueChange={handlePerPageChange}>
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
              disabled={isFetching || !hasMore}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
            >
              {isFetching ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Fetching...
                </>
              ) : (
                hasMore ? 'Fetch New Leads' : 'No More Leads'
              )}
            </Button>
          </div>
        </div>

        {/* CSV Actions Section */}
        <div className="mt-6 border-t border-slate-200 pt-6 space-y-4">
          {/* Download CSV */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4 text-slate-500" />
              <h3 className="font-medium text-slate-900">Export Data</h3>
            </div>
            <CsvDownload selectedIds={selectedIds} />
          </div>

          {/* CSV Upload Collapsible Section */}
          <Collapsible open={csvUploadOpen} onOpenChange={setCsvUploadOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload CSV File</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {csvUploadOpen ? 'Click to collapse' : 'Click to expand'}
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <CsvUpload onUploadComplete={onCsvUploadComplete} />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}
