"use client"

import { use, useMemo } from "react"
import Link from "next/link"
import { useGetForm, useGetFields, useGetFormAnalytics, useGetFormSubmissions } from "~/hooks/api/form"
import { Button } from "~/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { 
  ArrowLeftIcon, 
  BarChart3Icon, 
  CalendarIcon, 
  InboxIcon, 
  SparklesIcon,
  TrendingUpIcon,
  Loader2Icon,
  HelpCircleIcon,
  DownloadIcon
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts"

type AnalyticsPageProps = {
  params: Promise<{
    id: string
  }>
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { id: formId } = use(params)

  const { form, isLoading: formLoading } = useGetForm(formId)
  const { fields, isLoading: fieldsLoading } = useGetFields(formId)
  const { analytics, isLoading: analyticsLoading } = useGetFormAnalytics(formId)
  const { submissions } = useGetFormSubmissions(formId)

  const isLoading = formLoading || fieldsLoading || analyticsLoading
  const activeFields = fields?.fields ?? []
  const hasData = analytics && analytics.totalSubmissions > 0

  const exportToCSV = () => {
    if (!form || activeFields.length === 0 || !submissions || submissions.length === 0) return

    const headers = ["Submission ID", "Submitted At", ...activeFields.map(f => f.label)]
    
    const rows = submissions.map(sub => {
      const dateStr = sub.createdAt ? new Date(sub.createdAt).toISOString() : ""
      const values = activeFields.map(field => {
        const valObj = sub.values?.find(v => v.formFieldId === field.id)
        let display = valObj?.value ?? ""
        if (field.type === "YES_NO") {
          display = display === "true" ? "Yes" : display === "false" ? "No" : ""
        } else if (field.type === "MULTI_SELECT") {
          try {
            const arr = JSON.parse(display)
            if (Array.isArray(arr)) {
              display = arr.join(", ")
            }
          } catch(e) {}
        }
        // Escape quotes for valid CSV formatting
        return `"${display.replace(/"/g, '""')}"`
      })
      return [sub.id, dateStr, ...values].join(",")
    })

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${form.title.toLowerCase().replace(/\s+/g, "-")}-submissions.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalSubmissions = analytics?.totalSubmissions ?? 0

  const averageRatings = useMemo(() => {
    const ratings: Record<string, number> = {}
    if (!analytics || !activeFields.length) return ratings

    activeFields.forEach(field => {
      if (field.type === "NUMBER") {
        const fieldResponses = analytics.breakdown.filter(b => b.fieldId === field.id)
        let sum = 0
        let totalCount = 0
        fieldResponses.forEach(r => {
          const num = Number(r.value)
          if (!isNaN(num)) {
            sum += num * r.count
            totalCount += r.count
          }
        })
        if (totalCount > 0) {
          ratings[field.id] = parseFloat((sum / totalCount).toFixed(1))
        }
      }
    })
    return ratings
  }, [analytics, activeFields])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2Icon className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-neutral-400 font-medium tracking-wide">
            Aggregating form analytics from database...
          </p>
        </div>
      </div>
    )
  }

  // Formatting date helper for timeline
  const formatTimelineDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 max-w-7xl mx-auto space-y-8">
      {/* Top Navigation Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild size="sm" variant="ghost" className="hover:bg-neutral-800 text-neutral-400 hover:text-foreground">
            <Link href={`/dashboard/forms/${formId}`}>
              <ArrowLeftIcon className="size-4 mr-1.5" />
              Back to Builder
            </Link>
          </Button>
          <div className="h-4 w-px bg-neutral-800 hidden sm:block" />
          <p className="text-xs text-neutral-400 hidden sm:block font-medium tracking-wider uppercase">
            Performance Insights
          </p>
        </div>
        
        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          {hasData && (
            <Button
              size="sm"
              onClick={exportToCSV}
              className="bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-foreground shadow-sm transition-all flex items-center gap-1.5 font-medium"
            >
              <DownloadIcon className="size-3.5" />
              Export to CSV
            </Button>
          )}
          <Badge variant="outline" className="bg-indigo-550/10 text-indigo-400 border-indigo-500/20 px-3 py-1 font-semibold flex items-center gap-1.5 text-xs">
            <SparklesIcon className="size-3" />
            SQL Optimized
          </Badge>
        </div>
      </div>

      {/* Title Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-neutral-50 via-neutral-100 to-neutral-400">
            {form?.title} — Analytics
          </h1>
        </div>
        <p className="text-sm text-neutral-400 max-w-3xl leading-relaxed">
          {form?.description || "Real-time insights and statistical distributions computed natively on response data."}
        </p>
      </div>

      {/* Main Container */}
      {!hasData ? (
        <Card className="bg-neutral-900/40 border-neutral-800 backdrop-blur-md overflow-hidden p-16 text-center shadow-xl">
          <CardContent className="flex flex-col items-center justify-center p-0">
            <div className="p-4 rounded-full bg-neutral-800/40 text-neutral-500 mb-5 animate-pulse">
              <InboxIcon className="size-12" />
            </div>
            <h3 className="text-xl font-bold text-neutral-200 mb-2">No Responses Captured Yet</h3>
            <p className="text-sm text-neutral-400 max-w-sm mb-6 leading-relaxed">
              We need at least one form response before we can generate aggregations and charts. Share your public link to gather submissions!
            </p>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm" className="text-neutral-400 border-neutral-800 hover:bg-neutral-800">
                <Link href={`/form/${formId}`} target="_blank">
                  View Public Form
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-neutral-900/30 border-neutral-850 shadow-lg relative overflow-hidden group hover:border-neutral-750 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-neutral-400 group-hover:scale-110 transition-transform">
                <InboxIcon className="size-20" />
              </div>
              <CardContent className="p-6">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Submissions</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-foreground tracking-tight">{totalSubmissions}</span>
                  <span className="text-xs text-neutral-500 font-medium">responses</span>
                </div>
                <p className="mt-2 text-xs text-neutral-500">Natively aggregated in PostgreSQL</p>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900/30 border-neutral-850 shadow-lg relative overflow-hidden group hover:border-neutral-750 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-neutral-400 group-hover:scale-110 transition-transform">
                <TrendingUpIcon className="size-20" />
              </div>
              <CardContent className="p-6">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Response Frequency</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-indigo-400 tracking-tight">
                    {(totalSubmissions / Math.max(1, analytics?.timeline.length ?? 1)).toFixed(1)}
                  </span>
                  <span className="text-xs text-neutral-500 font-medium">per active day</span>
                </div>
                <p className="mt-2 text-xs text-neutral-500">Calculated over {analytics?.timeline.length} submission days</p>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900/30 border-neutral-850 shadow-lg relative overflow-hidden group hover:border-neutral-750 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-neutral-400 group-hover:scale-110 transition-transform">
                <BarChart3Icon className="size-20" />
              </div>
              <CardContent className="p-6">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Configured Fields</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-indigo-400 tracking-tight">{activeFields.length}</span>
                  <span className="text-xs text-neutral-500 font-medium">inputs</span>
                </div>
                <p className="mt-2 text-xs text-neutral-500">Collecting structured fields</p>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Trend AreaChart */}
          <Card className="bg-neutral-900/40 border-neutral-850 backdrop-blur-md shadow-xl overflow-hidden">
            <CardHeader className="border-b border-neutral-850 bg-neutral-900/20 px-6 py-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-indigo-400" />
                <div>
                  <CardTitle className="text-md font-bold text-foreground">Response Trend Timeline</CardTitle>
                  <CardDescription className="text-xs text-neutral-400">Daily chronological submission volume overview.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analytics.timeline}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatTimelineDate}
                      stroke="#737373"
                      fontSize={11}
                      dy={10}
                    />
                    <YAxis stroke="#737373" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#171717",
                        borderColor: "#262626",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#f5f5f5"
                      }}
                      labelFormatter={formatTimelineDate}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCount)"
                      name="Submissions"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Field Analysis Cards Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-neutral-300 flex items-center gap-2">
              <BarChart3Icon className="size-5 text-indigo-400" />
              Field-by-Field Breakdown
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeFields.map((field) => {
                // Filter all responses captured in DB for this field
                const fieldResponses = analytics.breakdown
                  .filter((b) => b.fieldId === field.id)
                  .sort((a, b) => b.count - a.count)

                const isYesNo = field.type === "YES_NO"
                const avgRating = averageRatings[field.id]

                return (
                  <Card key={field.id} className="bg-neutral-900/40 border-neutral-850 backdrop-blur-md shadow-lg flex flex-col justify-between hover:border-neutral-750 transition-colors duration-250">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-foreground text-md leading-tight">{field.label}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0.2 bg-neutral-800/80 text-neutral-300 border-neutral-700">
                              {field.type}
                            </Badge>
                          </div>
                          {field.description && (
                            <p className="text-xs text-neutral-400">{field.description}</p>
                          )}
                        </div>
                        {avgRating !== undefined && (
                          <div className="text-right shrink-0 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded">
                            <div className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Average</div>
                            <div className="text-lg font-black text-indigo-300">{avgRating}</div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 pt-0 flex-1 flex flex-col justify-end">
                      {fieldResponses.length === 0 ? (
                        <div className="text-neutral-500 text-xs py-8 text-center italic flex items-center justify-center gap-1.5">
                          <HelpCircleIcon className="size-4 shrink-0" />
                          No response values captured for this field.
                        </div>
                      ) : isYesNo ? (
                        /* YES_NO visual aggregate progress bar */
                        <div className="space-y-4 py-2">
                          {(() => {
                            const yesObj = fieldResponses.find((r) => r.value === "true")
                            const noObj = fieldResponses.find((r) => r.value === "false")
                            const yesVal = yesObj?.count ?? 0
                            const noVal = noObj?.count ?? 0
                            const total = yesVal + noVal
                            const yesPercent = total > 0 ? Math.round((yesVal / total) * 100) : 0
                            const noPercent = total > 0 ? 100 - yesPercent : 0

                            return (
                              <div className="space-y-3">
                                {/* Segment Bar */}
                                <div className="h-4 w-full rounded-full bg-neutral-850 overflow-hidden flex">
                                  <div 
                                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all" 
                                    style={{ width: `${yesPercent}%` }}
                                    title={`Yes: ${yesVal}`} 
                                  />
                                  <div 
                                    className="bg-neutral-700 h-full transition-all" 
                                    style={{ width: `${noPercent}%` }}
                                    title={`No: ${noVal}`} 
                                  />
                                </div>
                                {/* Legend Indicators */}
                                <div className="flex justify-between items-center text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                                    <span className="text-neutral-350">Yes</span>
                                    <span className="font-bold text-emerald-400 ml-1">{yesPercent}%</span>
                                    <span className="text-neutral-500 font-light">({yesVal})</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-neutral-600" />
                                    <span className="text-neutral-350">No</span>
                                    <span className="font-bold text-neutral-400 ml-1">{noPercent}%</span>
                                    <span className="text-neutral-500 font-light">({noVal})</span>
                                  </div>
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      ) : (
                        /* TEXT, NUMBER, EMAIL, PASSWORD top answers lists */
                        <div className="space-y-2.5">
                          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Top Answers:</p>
                          <div className="space-y-2">
                            {fieldResponses.slice(0, 5).map((response) => {
                              const percent = totalSubmissions > 0 ? Math.round((response.count / totalSubmissions) * 100) : 0
                              const isPassword = field.type === "PASSWORD"
                              const displayVal = isPassword ? "••••••••" : response.value

                              return (
                                <div key={response.value} className="space-y-1 text-xs">
                                  <div className="flex justify-between items-center gap-2">
                                    <span className="font-medium text-neutral-300 truncate max-w-[70%]" title={displayVal}>
                                      {displayVal}
                                    </span>
                                    <div className="flex items-center gap-1.5 shrink-0 text-neutral-400 font-medium">
                                      <span>{percent}%</span>
                                      <span className="text-neutral-600">({response.count})</span>
                                    </div>
                                  </div>
                                  <div className="h-1.5 w-full rounded-full bg-neutral-850 overflow-hidden">
                                    <div 
                                      className="bg-indigo-500/80 h-full rounded-full" 
                                      style={{ width: `${percent}%` }} 
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
