import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Clock, Zap, FileText, Gauge, TrendingUp, Shield, Search, Eye, Monitor, Smartphone } from "lucide-react"

interface DiagnosticItem {
  id: string
  title: string
  description: string
  score: number
  scoreDisplayMode: string
  displayValue?: string
  metricSavings?: {
    LCP?: number
    FCP?: number
    TBT?: number
  }
  numericValue?: number
  numericUnit?: string
  details?: {
    items?: any[]
    overallSavingsMs?: number
    overallSavingsBytes?: number
  }
}

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

interface PerformanceDiagnosticsProps {
  diagnosticsData: Record<string, DiagnosticItem>
  lead: Lead
}

const PerformanceDiagnostics = ({ diagnosticsData, lead }: PerformanceDiagnosticsProps) => {
  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default"
    if (score >= 50) return "secondary"
    return "destructive"
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBackgroundColor = (score: number) => {
    if (score >= 90) return "bg-green-100 border-green-300"
    if (score >= 50) return "bg-yellow-100 border-yellow-300"
    return "bg-red-100 border-red-300"
  }

  const getCircleStrokeColor = (score: number) => {
    if (score >= 90) return "stroke-green-500"
    if (score >= 50) return "stroke-yellow-500"
    return "stroke-red-500"
  }

  const getImpactIcon = (score: number) => {
    if (score === 0) return <AlertTriangle className="w-4 h-4 text-red-600" />
    if (score < 0.9) return <Clock className="w-4 h-4 text-yellow-600" />
    return <Zap className="w-4 h-4 text-green-600" />
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)} ms`
    return `${(ms / 1000).toFixed(1)} s`
  }

  const simplifyTitle = (title: string) => {
    const titleMap: { [key: string]: string } = {
      "Minimize main-thread work": "Website is working too hard",
      "Reduce JavaScript execution time": "Code is running slowly",
      "Minify JavaScript": "Code files are too large",
      "Reduce unused CSS": "Unused styling slowing things down",
      "Eliminate render-blocking resources": "Some files block the page from loading"
    }
    return titleMap[title] || title
  }

  const simplifyDescription = (title: string, description: string) => {
    const descriptionMap: { [key: string]: string } = {
      "Minimize main-thread work": "Your website is doing too much work at once, which makes it slow. We can fix this by reducing the workload.",
      "Reduce JavaScript execution time": "The code on your website takes too long to run. Making it more efficient will speed things up.",
      "Minify JavaScript": "Your code files are larger than they need to be. Making them smaller will help your site load faster.",
      "Reduce unused CSS": "Your website loads styling code that it doesn't actually use. Removing this will improve speed.",
      "Eliminate render-blocking resources": "Some files prevent your page from showing up quickly. We can fix this by reorganizing how they load."
    }
    return descriptionMap[title] || description
  }

  const priorityIssues = Object.entries(diagnosticsData).filter(([_, item]) => 
    item.score === 0 && item.scoreDisplayMode === "metricSavings"
  )

  const CircleProgress = ({ score, size = 120 }: { score: number, size?: number }) => {
    const radius = (size - 8) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (score / 100) * circumference

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-500 ${getCircleStrokeColor(score)}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score}
            </div>
            <div className="text-xs text-slate-500">/ 100</div>
          </div>
        </div>
      </div>
    )
  }

  // Extract real metrics data from diagnosticsData
  const getMetricsData = () => {
    const metrics = []
    
    // First Contentful Paint
    if (diagnosticsData['first-contentful-paint']) {
      const fcp = diagnosticsData['first-contentful-paint']
      metrics.push({
        name: "First Contentful Paint",
        value: fcp.displayValue || `${formatTime(fcp.numericValue || 0)}`,
        status: fcp.score >= 0.9 ? "good" : fcp.score >= 0.5 ? "needs-improvement" : "poor",
        icon: fcp.score >= 0.9 ? "🟢" : fcp.score >= 0.5 ? "🟡" : "🔺"
      })
    }

    // Largest Contentful Paint
    if (diagnosticsData['largest-contentful-paint']) {
      const lcp = diagnosticsData['largest-contentful-paint']
      metrics.push({
        name: "Largest Contentful Paint",
        value: lcp.displayValue || `${formatTime(lcp.numericValue || 0)}`,
        status: lcp.score >= 0.9 ? "good" : lcp.score >= 0.5 ? "needs-improvement" : "poor",
        icon: lcp.score >= 0.9 ? "🟢" : lcp.score >= 0.5 ? "🟡" : "🔺"
      })
    }

    // Total Blocking Time
    if (diagnosticsData['total-blocking-time']) {
      const tbt = diagnosticsData['total-blocking-time']
      metrics.push({
        name: "Total Blocking Time",
        value: tbt.displayValue || `${formatTime(tbt.numericValue || 0)}`,
        status: tbt.score >= 0.9 ? "good" : tbt.score >= 0.5 ? "needs-improvement" : "poor",
        icon: tbt.score >= 0.9 ? "🟢" : tbt.score >= 0.5 ? "🟡" : "🔺"
      })
    }

    // Cumulative Layout Shift
    if (diagnosticsData['cumulative-layout-shift']) {
      const cls = diagnosticsData['cumulative-layout-shift']
      metrics.push({
        name: "Cumulative Layout Shift",
        value: cls.displayValue || cls.numericValue?.toFixed(3) || "0",
        status: cls.score >= 0.9 ? "good" : cls.score >= 0.5 ? "needs-improvement" : "poor",
        icon: cls.score >= 0.9 ? "🟢" : cls.score >= 0.5 ? "🟡" : "🔺"
      })
    }

    // Speed Index
    if (diagnosticsData['speed-index']) {
      const si = diagnosticsData['speed-index']
      metrics.push({
        name: "Speed Index",
        value: si.displayValue || `${formatTime(si.numericValue || 0)}`,
        status: si.score >= 0.9 ? "good" : si.score >= 0.5 ? "needs-improvement" : "poor",
        icon: si.score >= 0.9 ? "🟢" : si.score >= 0.5 ? "🟡" : "🔺"
      })
    }

    // If no specific metrics found, return fallback metrics
    if (metrics.length === 0) {
      return [
        { name: "First Contentful Paint", value: "N/A", status: "poor", icon: "🔺" },
        { name: "Largest Contentful Paint", value: "N/A", status: "poor", icon: "🔺" },
        { name: "Total Blocking Time", value: "N/A", status: "needs-improvement", icon: "🟡" },
        { name: "Cumulative Layout Shift", value: "N/A", status: "good", icon: "🟢" },
        { name: "Speed Index", value: "N/A", status: "poor", icon: "🔺" }
      ]
    }

    return metrics
  }

  const metricsData = getMetricsData()

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case "good": return "text-green-600"
      case "needs-improvement": return "text-yellow-600"
      case "poor": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Performance Cards with Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desktop Performance with Circle and Metrics */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-blue-600" />
              <span>Desktop Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-6">
              <CircleProgress score={lead.website_speed_web || 0} />
            </div>
            
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold text-slate-900">Performance Metrics</h4>
              <Table>
                <TableBody>
                  {metricsData.map((metric, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center w-[50px] p-2">
                        <span className="text-sm">{metric.icon}</span>
                      </TableCell>
                      <TableCell className="font-medium text-sm p-2">{metric.name}</TableCell>
                      <TableCell className={`text-right font-bold text-sm p-2 ${getMetricStatusColor(metric.status)}`}>
                        {metric.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Performance with Circle and Metrics */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-purple-600" />
              <span>Mobile Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-6">
              <CircleProgress score={lead.website_speed_mobile || 0} />
            </div>
            
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold text-slate-900">Performance Metrics</h4>
              <Table>
                <TableBody>
                  {metricsData.map((metric, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center w-[50px] p-2">
                        <span className="text-sm">{metric.icon}</span>
                      </TableCell>
                      <TableCell className="font-medium text-sm p-2">{metric.name}</TableCell>
                      <TableCell className={`text-right font-bold text-sm p-2 ${getMetricStatusColor(metric.status)}`}>
                        {metric.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues Requiring Attention */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>What Can We Fix to Make Your Site Faster?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {priorityIssues.length > 0 ? (
            <div className="space-y-4">
              {priorityIssues.map(([key, item]) => (
                <div key={key} className="border-l-4 border-red-500 pl-4 py-3 bg-red-50 rounded-r-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getImpactIcon(item.score)}
                      <h4 className="font-semibold text-slate-900">{simplifyTitle(item.title)}</h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.displayValue && (
                        <Badge variant="destructive" className="text-xs">
                          {item.displayValue}
                        </Badge>
                      )}
                      {item.details?.overallSavingsMs && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          Could save {formatTime(item.details.overallSavingsMs)}
                        </Badge>
                      )}
                      {item.details?.overallSavingsBytes && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          Could save {formatBytes(item.details.overallSavingsBytes)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">{simplifyDescription(item.title, item.description)}</p>
                  
                  {item.metricSavings && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {item.metricSavings.LCP && item.metricSavings.LCP > 0 && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          Faster loading: {formatTime(item.metricSavings.LCP)}
                        </span>
                      )}
                      {item.metricSavings.FCP && item.metricSavings.FCP > 0 && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Quicker display: {formatTime(item.metricSavings.FCP)}
                        </span>
                      )}
                      {item.metricSavings.TBT && item.metricSavings.TBT > 0 && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          More responsive: {formatTime(item.metricSavings.TBT)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">💡 What This Means for You</h4>
                <p className="text-sm text-blue-800">
                  These improvements could make your website significantly faster, which means:
                  better user experience, higher search engine rankings, and potentially more customers!
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Zap className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">Great News! No Critical Issues Found</p>
              <p className="text-sm">Your website performance looks good!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technical Details (Simplified) */}
      {diagnosticsData['mainthread-work-breakdown'] && (
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <Gauge className="w-5 h-5 text-purple-600" />
              <span>What's Taking the Most Time?</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Total time your site is busy working</span>
                <span className={`text-lg font-bold ${getScoreColor(diagnosticsData['mainthread-work-breakdown'].score)}`}>
                  {diagnosticsData['mainthread-work-breakdown'].displayValue}
                </span>
              </div>
            </div>
            
            {diagnosticsData['mainthread-work-breakdown'].details?.items && (
              <div className="space-y-2">
                {diagnosticsData['mainthread-work-breakdown'].details.items.map((item: any, index: number) => {
                  const friendlyLabels: { [key: string]: string } = {
                    "Script Evaluation": "Running code",
                    "Other": "Other tasks",
                    "Style & Layout": "Organizing layout",
                    "Rendering": "Drawing the page"
                  }
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">
                        {friendlyLabels[item.groupLabel] || item.groupLabel}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{formatTime(item.duration)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {diagnosticsData['network-rtt'] && (
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-cyan-600" />
              <span>Connection Speed to Different Servers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Slowest connection time</span>
                <span className="text-lg font-bold text-slate-900">
                  {diagnosticsData['network-rtt'].displayValue}
                </span>
              </div>
            </div>
            
            <div className="text-sm text-slate-700 mb-4">
              This shows how long it takes to connect to different servers your website uses.
            </div>

            {diagnosticsData['network-rtt'].details?.items?.slice(0, 5).map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 border-b border-slate-100 last:border-b-0">
                <span className="text-xs text-slate-600 truncate max-w-xs">{item.origin}</span>
                <span className="text-xs font-medium text-slate-900">{Math.round(item.rtt)} ms</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {diagnosticsData['diagnostics'] && (
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-green-600" />
              <span>Website Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {diagnosticsData['diagnostics'].details?.items?.[0] && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(diagnosticsData['diagnostics'].details.items[0])
                  .filter(([key]) => !['rtt', 'throughput'].includes(key))
                  .map(([key, value]: [string, any]) => {
                    const friendlyNames: { [key: string]: string } = {
                      'numRequests': 'Total Requests',
                      'totalByteWeight': 'Total Size',
                      'numScripts': 'Script Files',
                      'numStylesheets': 'Style Files',
                      'numFonts': 'Font Files',
                      'mainDocumentTransferSize': 'Page Size'
                    }
                    
                    return (
                      <div key={key} className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-xs text-slate-600 mb-1">
                          {friendlyNames[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          {typeof value === 'number' && key.includes('Size') ? formatBytes(value) : value}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PerformanceDiagnostics
