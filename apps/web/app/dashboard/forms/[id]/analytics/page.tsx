"use client"

import { use, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useGetForm, useGetFields, useGetFormAnalytics, useGetFormSubmissions } from "~/hooks/api/form"
import { Button } from "~/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Progress } from "~/components/ui/progress"
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
  LineChart,
  Line,
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
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2Icon className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm text-slate-400 font-medium tracking-wide font-mono">
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-center bg-[#18181b] border-2 border-[#365314] rounded-sm p-4 mb-8 shadow-2xl gap-4">
        <div className="flex items-center gap-4">
          <Button asChild size="sm" variant="ghost" className="hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
            <Link href={`/dashboard/forms/${formId}`}>
              <ArrowLeftIcon className="size-4 mr-1.5" />
              Back to Builder
            </Link>
          </Button>
          <div className="h-8 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-3">
            {/* Crafting Table brand logo with crisp pixels */}
            <div className="relative w-10 h-10 shrink-0">
              <Image 
                src="/assets/minecraft/blocks/Crafting_Table.png" 
                alt="Logo" 
                fill 
                className="object-contain" 
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">Formz Core Console</h1>
              <p className="text-xs text-slate-400 font-mono">tRPC Ecosystem // Analytics Node</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          {hasData && (
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 rounded-sm border-2 border-[#365314] bg-[#18181b] px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-all cursor-pointer shadow-md active:translate-y-[2px]"
            >
              <div className="relative w-5 h-5 shrink-0">
                <Image 
                  src="/assets/minecraft/blocks/Chest.png" 
                  alt="CSV Export" 
                  fill 
                  className="object-contain" 
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <span className="text-xs font-semibold">Export to CSV</span>
            </button>
          )}
        </div>
      </header>

      {/* Title Header */}
      <div className="space-y-2 bg-slate-900/50 border border-slate-800/80 p-5 rounded-sm">
        <h2 className="text-2xl font-black text-white tracking-tight">
          {form?.title}
        </h2>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          {form?.description || "Real-time insights and statistical distributions computed natively on response data."}
        </p>
      </div>

      {/* Main Container */}
      {!hasData ? (
        <Card className="bg-[#18181b] border-2 border-[#365314] overflow-hidden p-16 text-center shadow-xl rounded-sm">
          <CardContent className="flex flex-col items-center justify-center p-0">
            <div className="p-4 rounded-sm bg-slate-950 border border-slate-800 text-slate-500 mb-5 animate-pulse">
              <InboxIcon className="size-12" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">No Responses Captured Yet</h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
              We need at least one form response before we can generate aggregations and charts. Share your public link to gather submissions!
            </p>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm" className="text-slate-400 border-slate-800 hover:bg-slate-800">
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
            <Card className="bg-[#18181b] border-2 border-[#365314] shadow-xl relative overflow-hidden rounded-sm transition-all duration-300 hover:border-slate-700/60">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Total Stored Responses</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white tracking-tight">{totalSubmissions}</span>
                    <span className="text-xs text-slate-500 font-medium font-mono">responses</span>
                  </div>
                  <p className="mt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Natively aggregated in PostgreSQL
                  </p>
                </div>
                {/* Glowing Emerald Gem Item from items folder */}
                <div className="relative w-14 h-14 bg-slate-950 border border-slate-800 p-2 rounded-sm shrink-0 flex items-center justify-center shadow-glow-emerald">
                  <Image 
                    src="/assets/minecraft/items/Emerald.png" 
                    alt="Responses" 
                    fill 
                    className="p-2 object-contain" 
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#18181b] border-2 border-[#365314] shadow-xl relative overflow-hidden rounded-sm transition-all duration-300 hover:border-slate-700/60">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Response Frequency</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-[#a3e635] tracking-tight">
                      {(totalSubmissions / Math.max(1, analytics?.timeline.length ?? 1)).toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium font-mono">per active day</span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">Calculated over {analytics?.timeline.length} active days</p>
                </div>
                <div className="relative w-14 h-14 bg-slate-950 border border-slate-800 p-2 rounded-sm shrink-0 flex items-center justify-center text-[#84cc16] opacity-80 shadow-glow-emerald">
                  <TrendingUpIcon className="size-8 animate-pulse" />
                </div>
              </CardContent>
            </Card>

            {/* Gamified XP Progress Indicator card instead of Configured Fields */}
            <Card className="bg-[#18181b] border-2 border-[#365314] shadow-xl relative overflow-hidden rounded-sm transition-all duration-300 hover:border-slate-700/60">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Goal Quota Progress</p>
                  <span className="text-xs font-bold text-lime-400 font-mono">LVL {Math.min(100, Math.round((totalSubmissions / 100) * 100))}%</span>
                </div>
                {/* The clean, tactile XP progress bar */}
                <Progress 
                  value={Math.min(100, Math.round((totalSubmissions / 100) * 100))}
                  className="mt-1"
                />
                <p className="mt-3 text-[11px] text-slate-500">Targeting 100 total submissions level</p>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Trend Chart */}
          <Card className="bg-[#18181b] border-2 border-[#365314] shadow-xl overflow-hidden relative rounded-sm">
            {/* Immersive Minecraft background scenery banner canvas with mix-blend-overlay */}
            <div 
              className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay bg-cover bg-center"
              style={{ backgroundImage: "url('/assets/minecraft/backgrounds/Creeper_Woods.png')", imageRendering: "pixelated" }}
            />
            <CardHeader className="border-b-2 border-slate-950 bg-slate-900/50 px-6 py-4 relative z-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="size-4 text-emerald-400" />
                  <div>
                    <CardTitle className="text-md font-bold text-white">Data Transmission Feed</CardTitle>
                    <CardDescription className="text-xs text-slate-400 font-mono">Daily chronological submission volume overview.</CardDescription>
                  </div>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-sm font-semibold border border-emerald-500/20 flex items-center gap-1.5 shadow-glow-emerald">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Pipeline
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6 relative z-10">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analytics.timeline}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatTimelineDate}
                      stroke="#64748b"
                      fontSize={11}
                      dy={10}
                      tickLine={false}
                    />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: "#f5f5f5"
                      }}
                      labelFormatter={(label) => formatTimelineDate(label as string)}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981" // Vibrant Emerald Green Line
                      strokeWidth={3.5}
                      dot={{ r: 5, fill: "#10b981", strokeWidth: 0 }}
                      name="Submissions"
                      style={{ filter: "drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Field Analysis Cards Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-pixel tracking-wide text-slate-300 flex items-center gap-2">
              <BarChart3Icon className="size-5 text-[#84cc16]" />
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
                  <Card key={field.id} className="bg-[#18181b] border-2 border-[#365314] shadow-lg flex flex-col justify-between hover:border-slate-700/60 transition-colors duration-250 rounded-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-md leading-tight">{field.label}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0.2 bg-slate-950 text-slate-350 border-slate-805 rounded-sm">
                              {field.type}
                            </Badge>
                          </div>
                          {field.description && (
                            <p className="text-xs text-slate-400">{field.description}</p>
                          )}
                        </div>
                        {avgRating !== undefined && (
                          <div className="text-right shrink-0 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-sm font-mono">
                            <div className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Average</div>
                            <div className="text-lg font-black text-emerald-300">{avgRating}</div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 pt-0 flex-1 flex flex-col justify-end">
                      {fieldResponses.length === 0 ? (
                        <div className="text-slate-500 text-xs py-8 text-center italic flex items-center justify-center gap-1.5 font-mono">
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
                                {/* Segment Bar (XP colored double segments) */}
                                <div className="h-4 w-full border-2 border-slate-800 bg-slate-950 overflow-hidden flex p-0.5 rounded-none">
                                  <div 
                                    className="bg-lime-500 h-full transition-all" 
                                    style={{ 
                                      width: `${yesPercent}%`,
                                      boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.2)'
                                    }}
                                    title={`Yes: ${yesVal}`} 
                                  />
                                  <div 
                                    className="bg-slate-800 h-full transition-all" 
                                    style={{ 
                                      width: `${noPercent}%`,
                                      boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.3)'
                                    }}
                                    title={`No: ${noVal}`} 
                                  />
                                </div>
                                {/* Legend Indicators */}
                                <div className="flex justify-between items-center text-xs font-mono">
                                  <div className="flex items-center gap-1.5">
                                    <div className="h-2.5 w-2.5 bg-lime-500 border border-lime-600 rounded-none" />
                                    <span className="text-slate-350">Yes</span>
                                    <span className="font-bold text-lime-400 ml-1">{yesPercent}%</span>
                                    <span className="text-slate-500">({yesVal})</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="h-2.5 w-2.5 bg-slate-800 border border-slate-700 rounded-none" />
                                    <span className="text-slate-355">No</span>
                                    <span className="font-bold text-slate-400 ml-1">{noPercent}%</span>
                                    <span className="text-slate-500">({noVal})</span>
                                  </div>
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      ) : (
                        /* TEXT, NUMBER, EMAIL, PASSWORD top answers lists */
                        <div className="space-y-2.5">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 font-mono">Top Answers:</p>
                          <div className="space-y-3">
                            {fieldResponses.slice(0, 5).map((response) => {
                              const percent = totalSubmissions > 0 ? Math.round((response.count / totalSubmissions) * 100) : 0
                              const isPassword = field.type === "PASSWORD"
                              const displayVal = isPassword ? "••••••••" : response.value

                              return (
                                <div key={response.value} className="space-y-2 text-xs">
                                  <div className="flex justify-between items-center gap-2">
                                    <span className="font-medium text-slate-300 truncate max-w-[70%]" title={displayVal}>
                                      {displayVal}
                                    </span>
                                    <div className="flex items-center gap-1.5 shrink-0 text-slate-400 font-mono">
                                      <span>{percent}%</span>
                                      <span className="text-slate-500">({response.count})</span>
                                    </div>
                                  </div>
                                  {/* The clean, tactile XP progress bar for response distribution */}
                                  <Progress value={percent} className="h-3" />
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
