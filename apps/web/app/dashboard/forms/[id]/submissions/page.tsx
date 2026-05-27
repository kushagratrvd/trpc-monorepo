"use client"

import { use } from "react"
import Link from "next/link"
import { useGetForm, useGetFields, useGetFormSubmissions } from "~/hooks/api/form"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { ArrowLeftIcon, CalendarIcon, InboxIcon, DownloadIcon, LayersIcon } from "lucide-react"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { Separator } from "~/components/ui/separator"

type SubmissionsPageProps = {
  params: Promise<{
    id: string
  }>
}

export default function SubmissionsPage({ params }: SubmissionsPageProps) {
  const { id: formId } = use(params)

  const { form, isLoading: formLoading } = useGetForm(formId)
  const { fields, isLoading: fieldsLoading } = useGetFields(formId)
  const { submissions, isLoading: submissionsLoading } = useGetFormSubmissions(formId)

  const isLoading = formLoading || fieldsLoading || submissionsLoading
  const hasSubmissions = submissions && submissions.length > 0
  const activeFields = fields?.fields ?? []

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "—"
    return new Date(date).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Back navigation & Export action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#18181b] border-2 border-[#365314] p-4 rounded-sm shadow-md">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
          <Button asChild size="sm" variant="ghost" className="hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
            <Link href={`/dashboard/forms/${formId}`}>
              <ArrowLeftIcon className="size-4 mr-1.5" />
              Back to Builder
            </Link>
          </Button>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <p className="text-xs text-slate-400 font-mono hidden sm:block">
            Form Submissions Insights
          </p>
        </div>

        {hasSubmissions && (
          <Button
            size="sm"
            onClick={exportToCSV}
            className="text-xs"
          >
            <DownloadIcon className="size-3.5 mr-1" />
            Export to CSV
          </Button>
        )}
      </div>

      {/* Main card header */}
      <div className="space-y-2 bg-slate-900/50 border border-slate-800/80 p-5 rounded-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">
            {formLoading ? <Skeleton className="h-8 w-64" /> : `Submissions for ${form?.title}`}
          </h1>
          {!isLoading && hasSubmissions && (
            <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-semibold bg-[#84cc16]/10 text-[#84cc16] border border-[#365314]/30 rounded-sm">
              {submissions.length} Total
            </Badge>
          )}
        </div>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          {formLoading ? (
            <Skeleton className="h-4 w-96" />
          ) : (
            form?.description || "View, search, and analyze all captured public submissions of this form."
          )}
        </p>
      </div>

      {/* Dynamic submissions display card */}
      <Card className="bg-[#18181b] border-2 border-[#365314] overflow-hidden shadow-xl rounded-sm">
        <CardContent className="p-0">
          {isLoading ? (
            /* Skeleton Loading State */
            <div className="p-6 space-y-4">
              <div className="flex gap-4 border-b border-slate-800 pb-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-36" />
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center py-2">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : activeFields.length === 0 ? (
            /* No Fields Configuration State */
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="p-4 rounded-sm bg-slate-950 border border-slate-800 text-slate-500 mb-4">
                <LayersIcon className="size-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">No Fields Available</h3>
              <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
                You must add fields to your form in the builder before you can view submissions.
              </p>
              <Button asChild size="sm">
                <Link href={`/dashboard/forms/${formId}`}>Configure Fields</Link>
              </Button>
            </div>
          ) : !hasSubmissions ? (
            /* No Submissions Captured State */
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="p-4 rounded-sm bg-slate-950 border border-slate-800 text-slate-500 mb-4 animate-pulse">
                <InboxIcon className="size-12" />
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">No Submissions Yet</h3>
              <p className="text-sm text-slate-400 max-w-xs mb-6 leading-relaxed">
                This form has not received any responses yet. Share your public link to start collecting submissions!
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href={`/form/${formId}`} target="_blank">
                  View Public Form
                </Link>
              </Button>
            </div>
          ) : (
            /* Tabular Submissions Display State */
            <div className="overflow-x-auto w-full max-w-full">
              <Table className="border-0 shadow-none">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-60">
                      Submitted At
                    </TableHead>
                    {activeFields.map((field) => (
                      <TableHead key={field.id} className="min-w-[150px]">
                        {field.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="size-3.5 text-slate-500 shrink-0" />
                          {formatDate(submission.createdAt)}
                        </div>
                      </TableCell>
                      {activeFields.map((field) => {
                        const valObj = submission.values?.find(
                          (v) => v.formFieldId === field.id
                        )
                        const displayValue = valObj?.value ?? ""

                        return (
                          <TableCell key={field.id}>
                            {displayValue === "" ? (
                              <span className="text-slate-600 font-light">—</span>
                            ) : field.type === "YES_NO" ? (
                              displayValue === "true" ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-2 py-0.5 rounded-sm">
                                  Yes
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-slate-800 text-slate-400 border border-slate-700 text-xs font-semibold px-2 py-0.5 rounded-sm">
                                  No
                                </Badge>
                              )
                            ) : field.type === "PASSWORD" ? (
                              <code className="text-xs tracking-widest text-slate-400 bg-slate-950/40 px-1.5 py-0.5 rounded-sm font-mono">
                                ••••••••
                              </code>
                            ) : (
                              <span className="truncate block max-w-xs" title={displayValue}>
                                {displayValue}
                              </span>
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
