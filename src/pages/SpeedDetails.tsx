"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Gauge, Monitor, Smartphone, RefreshCw, Globe, Mail, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import PerformanceDiagnostics from "@/components/PerformanceDiagnostics"

interface Lead {
  id: number
  first_name: string
  last_name: string
  email: string
  title?: string
  company: string
  website_url?: string
  website_speed_web?: number
  website_speed_mobile?: number
}

const SpeedDetails = () => {
  const { leadId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [diagnosticsData, setDiagnosticsData] = useState<any>(null)

  // Sample diagnostics data - replace this with actual API call
  const sampleDiagnosticsData = {
    "diagnostics": {
      "id": "diagnostics",
      "title": "Diagnostics",
      "description": "Collection of useful page vitals.",
      "score": 1,
      "scoreDisplayMode": "informative",
      "details": {
        "items": [{
          "numTasksOver10ms": 41,
          "maxRtt": 99.05192999999998,
          "numScripts": 59,
          "numTasksOver25ms": 20,
          "numFonts": 8,
          "numTasksOver100ms": 3,
          "mainDocumentTransferSize": 30272,
          "rtt": 0.0002671325198629551,
          "maxServerLatency": 106,
          "totalTaskTime": 3630.4659999999913,
          "numTasksOver50ms": 10,
          "numRequests": 261,
          "numStylesheets": 12,
          "numTasksOver500ms": 0,
          "numTasks": 5110,
          "throughput": 443006869.6480165,
          "totalByteWeight": 18406660
        }],
        "type": "debugdata"
      }
    },
    "network-rtt": {
      "id": "network-rtt",
      "title": "Network Round Trip Times",
      "description": "Network round trip times (RTT) have a large impact on performance. If the RTT to an origin is high, it's an indication that servers closer to the user could improve performance.",
      "score": 1,
      "scoreDisplayMode": "informative",
      "displayValue": "100 ms",
      "details": {
        "type": "table",
        "items": [
          {"rtt": 99.05192999999998, "origin": "https://collector-7865.tvsquared.com"},
          {"rtt": 46.965105, "origin": "https://ad.ipredictive.com"},
          {"rtt": 33.461639999999996, "origin": "https://6jk6d9jp92.execute-api.us-east-2.amazonaws.com"},
          {"rtt": 28.447425, "origin": "https://cdn.trustedform.com"},
          {"rtt": 26.803770000000007, "origin": "https://brands-api.consumeraffairs.com"}
        ]
      }
    },
    "mainthread-work-breakdown": {
      "id": "mainthread-work-breakdown",
      "title": "Minimize main-thread work",
      "description": "Consider reducing the time spent parsing, compiling and executing JS. You may find delivering smaller JS payloads helps with this.",
      "score": 0,
      "scoreDisplayMode": "metricSavings",
      "displayValue": "4.4 s",
      "metricSavings": {"TBT": 250},
      "details": {
        "items": [
          {"duration": 1841.4587999999358, "group": "scriptEvaluation", "groupLabel": "Script Evaluation"},
          {"group": "other", "groupLabel": "Other", "duration": 1202.6963999999753},
          {"duration": 473.49479999999903, "group": "styleLayout", "groupLabel": "Style & Layout"},
          {"group": "paintCompositeRender", "duration": 417.04439999999516, "groupLabel": "Rendering"}
        ]
      }
    },
    "bootup-time": {
      "id": "bootup-time",
      "title": "Reduce JavaScript execution time",
      "description": "Consider reducing the time spent parsing, compiling, and executing JS. You may find delivering smaller JS payloads helps with this.",
      "score": 0,
      "scoreDisplayMode": "metricSavings",
      "displayValue": "1.6 s",
      "metricSavings": {"TBT": 400},
      "details": {
        "overallSavingsMs": 1593.6395999999947
      }
    },
    "unminified-javascript": {
      "id": "unminified-javascript",
      "title": "Minify JavaScript",
      "description": "Minifying JavaScript files can reduce payload sizes and script parse time.",
      "score": 0,
      "scoreDisplayMode": "metricSavings",
      "displayValue": "Est savings of 54 KiB",
      "metricSavings": {"LCP": 300, "FCP": 0},
      "details": {
        "overallSavingsBytes": 55638,
        "overallSavingsMs": 300
      }
    },
    "unused-css-rules": {
      "id": "unused-css-rules",
      "title": "Reduce unused CSS",
      "description": "Reduce unused rules from stylesheets and defer CSS not used for above-the-fold content to decrease bytes consumed by network activity.",
      "score": 0,
      "scoreDisplayMode": "metricSavings",
      "displayValue": "Est savings of 261 KiB",
      "metricSavings": {"LCP": 600, "FCP": 0},
      "details": {
        "overallSavingsBytes": 266853,
        "overallSavingsMs": 600
      }
    },
    "render-blocking-resources": {
      "id": "render-blocking-resources",
      "title": "Eliminate render-blocking resources",
      "description": "Resources are blocking the first paint of your page. Consider delivering critical JS/CSS inline and deferring all non-critical JS/styles.",
      "score": 0,
      "scoreDisplayMode": "metricSavings",
      "displayValue": "Est savings of 150 ms",
      "metricSavings": {"LCP": 0, "FCP": 150},
      "details": {
        "overallSavingsMs": 150
      }
    }
  }

  useEffect(() => {
    loadLeadDetails()
    // TODO: Replace with actual API call to get diagnostics data
    setDiagnosticsData(sampleDiagnosticsData)
  }, [leadId])

  const loadLeadDetails = async () => {
    try {
      setLoading(true)
      console.log('Loading lead details for ID:', leadId)
      
      // Fetch all leads since individual lead endpoint doesn't exist
      const response = await fetch(`http://localhost:8000/leads?skip=0&limit=100`)
      if (response.ok) {
        const leads = await response.json()
        console.log('Fetched leads:', leads)
        
        // Find the specific lead by ID
        const foundLead = leads.find((l: Lead) => l.id === parseInt(leadId || '0'))
        
        if (foundLead) {
          console.log('Found lead:', foundLead)
          setLead(foundLead)
        } else {
          console.log('Lead not found with ID:', leadId)
          toast({
            title: "Error",
            description: "Lead not found",
            variant: "destructive",
          })
          navigate("/dashboard")
        }
      } else {
        console.error('Failed to fetch leads, status:', response.status)
        toast({
          title: "Error",
          description: "Failed to load lead details",
          variant: "destructive",
        })
        navigate("/dashboard")
      }
    } catch (error) {
      console.error("Error loading lead details:", error)
      toast({
        title: "Error",
        description: "Failed to load lead details",
        variant: "destructive",
      })
      navigate("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshSpeed = async () => {
    if (!leadId) return

    setRefreshing(true)
    toast({
      title: "Speed Test Started",
      description: "Refreshing speed test results...",
    })

    try {
      const response = await fetch(`http://localhost:8000/speedtest/${leadId}`, {
        method: "POST",
      })
      const data = await response.json()

      toast({
        title: "Speed Test Complete",
        description: data.message || "Speed test completed successfully",
      })

      await loadLeadDetails()
    } catch (error) {
      console.error("Error refreshing speed:", error)
      toast({
        title: "Speed Test Failed",
        description: "Failed to refresh speed test",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const getSpeedColor = (speed: number | null) => {
    if (!speed) return "text-gray-500"
    if (speed >= 90) return "text-green-600"
    if (speed >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getSpeedBadgeVariant = (speed: number | null) => {
    if (!speed) return "secondary"
    if (speed >= 90) return "default"
    if (speed >= 50) return "secondary"
    return "destructive"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-slate-600">Loading lead details...</span>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Lead not found</h2>
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button onClick={() => navigate("/dashboard")} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Website Speed Analysis</h1>
              <p className="text-slate-600">Performance metrics and detailed insights</p>
            </div>
          </div>
          <Button onClick={handleRefreshSpeed} disabled={refreshing} className="bg-blue-600 hover:bg-blue-700">
            {refreshing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Gauge className="w-4 h-4 mr-2" />
            )}
            {refreshing ? "Testing..." : "Run New Speed Test"}
          </Button>
        </div>

        {/* Lead Details Section */}
        <Card className="mb-8 shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="flex items-center space-x-2 text-xl">
              <User className="w-6 h-6 text-blue-600" />
              <span>Lead Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Contact Details</h3>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-slate-900">{lead.first_name} {lead.last_name}</p>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{lead.email}</span>
                  </div>
                  {lead.title && <p className="text-sm text-slate-500 font-medium">{lead.title}</p>}
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Company</h3>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-slate-900">{lead.company}</p>
                  {lead.website_url && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <a
                        href={lead.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Desktop Score</h3>
                <div className="space-y-2">
                  <div className={`text-3xl font-bold ${getSpeedColor(lead.website_speed_web)}`}>
                    {lead.website_speed_web || "N/A"}
                  </div>
                  <Badge variant={getSpeedBadgeVariant(lead.website_speed_web)}>
                    {lead.website_speed_web ? `${lead.website_speed_web}/100` : "Not Tested"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Mobile Score</h3>
                <div className="space-y-2">
                  <div className={`text-3xl font-bold ${getSpeedColor(lead.website_speed_mobile)}`}>
                    {lead.website_speed_mobile || "N/A"}
                  </div>
                  <Badge variant={getSpeedBadgeVariant(lead.website_speed_mobile)}>
                    {lead.website_speed_mobile ? `${lead.website_speed_mobile}/100` : "Not Tested"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Diagnostics - now includes the desktop/mobile performance cards with sliders and metrics table */}
        {diagnosticsData && lead && <PerformanceDiagnostics diagnosticsData={diagnosticsData} lead={lead} />}
      </div>
    </div>
  )
}

export default SpeedDetails
