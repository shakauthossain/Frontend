import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/api';

interface CsvDownloadProps {
  selectedIds?: number[];
}

const AVAILABLE_COLUMNS = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'title', label: 'Title' },
  { key: 'company', label: 'Company' },
  { key: 'website_url', label: 'Website URL' },
  { key: 'linkedin_url', label: 'LinkedIn URL' },
  { key: 'website_speed_web', label: 'Website Speed (Desktop)' },
  { key: 'website_speed_mobile', label: 'Website Speed (Mobile)' },
  { key: 'screenshot_url_web', label: 'Screenshot URL' },
  { key: 'ghl_contact_id', label: 'GHL Contact ID' },
  { key: 'conversation_id', label: 'Conversation ID' },
  { key: 'mail_sent', label: 'Mail Sent' },
  { key: 'email_subject', label: 'Email Subject' },
  { key: 'punchline1', label: 'Punchline 1' },
  { key: 'punchline2', label: 'Punchline 2' },
  { key: 'punchline3', label: 'Punchline 3' },
];

export function CsvDownload({ selectedIds = [] }: CsvDownloadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'first_name', 'last_name', 'email', 'company', 'website_url'
  ]);
  const [downloading, setDownloading] = useState(false);

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(col => col !== columnKey)
        : [...prev, columnKey]
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(AVAILABLE_COLUMNS.map(col => col.key));
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  const sortedSelectedColumns = selectedColumns.sort((a, b) => {
    const aIndex = AVAILABLE_COLUMNS.findIndex(col => col.key === a);
    const bIndex = AVAILABLE_COLUMNS.findIndex(col => col.key === b);
    return aIndex - bIndex;
  });

  const handleDownload = async () => {
    if (selectedColumns.length === 0) {
      toast.error('Please select at least one column to download');
      return;
    }

    setDownloading(true);
    
    try {
      // Use the selected leads endpoint for POST request
      const endpoint = selectedIds.length > 0 
        ? `${API_BASE_URL}/download-csv-selected`
        : `${API_BASE_URL}/download-csv`;

      let res;
      
      if (selectedIds.length > 0) {
        // POST request for selected leads
        res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lead_ids: selectedIds,
            columns: sortedSelectedColumns.join(',')
          })
        });
      } else {
        // GET request for all leads
        const params = new URLSearchParams({
          columns: sortedSelectedColumns.join(',')
        });
        res = await fetch(`${endpoint}?${params.toString()}`);
      }
      
      if (!res.ok) {
        throw new Error('Failed to download CSV');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedIds.length > 0 ? 'leads_selected.csv' : 'leads.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success('CSV downloaded successfully');
      setIsOpen(false);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download CSV. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Download CSV
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Select Columns to Download</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex-1"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                className="flex-1"
              >
                Deselect All
              </Button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-3 border rounded-lg p-3">
              {AVAILABLE_COLUMNS.map((column) => (
                <div key={column.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.key}
                    checked={selectedColumns.includes(column.key)}
                    onCheckedChange={() => handleColumnToggle(column.key)}
                  />
                  <Label htmlFor={column.key} className="text-sm cursor-pointer">
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>

            {selectedIds.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Will download {selectedIds.length} selected leads
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
                disabled={downloading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDownload}
                disabled={downloading || selectedColumns.length === 0}
                className="flex-1"
              >
                {downloading ? 'Downloading...' : 'Download'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}