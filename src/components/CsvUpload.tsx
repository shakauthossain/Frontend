import { useState } from "react"
import { API_BASE_URL } from "@/config/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileSpreadsheet } from "lucide-react"

interface CsvUploadProps {
  onUploadComplete?: () => void
}

interface ColumnMapping {
  csvColumn: string
  dbField: string
}

const dbFields = [
  { value: "first_name", label: "First Name" },
  { value: "last_name", label: "Last Name" },
  { value: "email", label: "Email" },
  { value: "title", label: "Title" },
  { value: "company", label: "Company" },
  { value: "website_url", label: "Website URL" },
  { value: "linkedin_url", label: "LinkedIn URL" },
  { value: "skip", label: "Skip Column" },
]

export const CsvUpload = ({ onUploadComplete }: CsvUploadProps) => {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showMapping, setShowMapping] = useState(false)
  const [csvColumns, setCsvColumns] = useState<string[]>([])
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([])
  const { toast } = useToast()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)

    // Parse CSV headers
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        setCsvColumns(headers)
        setColumnMappings(headers.map(col => ({ csvColumn: col, dbField: 'skip' })))
        setShowMapping(true)
      }
    }
    reader.readAsText(selectedFile)
  }

  const handleMappingChange = (index: number, dbField: string) => {
    const newMappings = [...columnMappings]
    newMappings[index].dbField = dbField
    setColumnMappings(newMappings)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    
    try {
      // Transform mappings to the required format
      const mapping: Record<string, string> = {}
      columnMappings.forEach(({ csvColumn, dbField }) => {
        if (dbField !== 'skip') {
          mapping[dbField] = csvColumn
        }
      })

      const formData = new FormData()
      formData.append('file', file)
      formData.append('mapping', JSON.stringify(mapping))

      const response = await fetch(`${API_BASE_URL}/upload-csv`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "CSV Uploaded Successfully",
          description: "Your leads have been imported",
        })
        
        setShowMapping(false)
        setFile(null)
        setCsvColumns([])
        setColumnMappings([])
        onUploadComplete?.()
      } else {
        const error = await response.text()
        toast({
          title: "Upload Failed",
          description: error || "Failed to upload CSV",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <FileSpreadsheet className="h-4 w-4" />
          <Label htmlFor="csv-upload" className="text-sm font-medium">
            Upload CSV File
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="flex-1"
          />
          <Button
            onClick={() => document.getElementById('csv-upload')?.click()}
            variant="outline"
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Browse
          </Button>
        </div>

        {file && (
          <p className="text-sm text-muted-foreground">
            Selected: {file.name}
          </p>
        )}
      </div>

      <Dialog open={showMapping} onOpenChange={setShowMapping}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Map CSV Columns to Database Fields</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select which database field each CSV column should map to:
            </p>
            
            <div className="space-y-3">
              {csvColumns.map((column, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-1/2">
                    <Label className="text-sm font-medium">{column}</Label>
                  </div>
                  <div className="w-1/2">
                    <Select
                      value={columnMappings[index]?.dbField || 'skip'}
                      onValueChange={(value) => handleMappingChange(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dbFields.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowMapping(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload CSV"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}