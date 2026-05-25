"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { CheckCircle2Icon, FileTextIcon, ArrowLeftIcon } from "lucide-react"

type SuccessPageProps = {
  params: Promise<{
    form_id: string
  }>
}

export default function SuccessPage({ params }: SuccessPageProps) {
  const { form_id: formId } = use(params)
  const router = useRouter()
  const [submissionInfo, setSubmissionInfo] = useState<{
    formTitle: string;
    fields: { id: string; label: string; type: string; labelKey: string }[];
    data: Record<string, any>;
  } | null>(null)

  useEffect(() => {
    const storedData = sessionStorage.getItem(`formz_submission_${formId}`)
    if (storedData) {
      try {
        setSubmissionInfo(JSON.parse(storedData))
      } catch (err) {
        console.error("Failed to parse submission data", err)
      }
    }
  }, [formId])

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-neutral-950 overflow-hidden">
      <div className="absolute top-1/4 -left-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="relative w-full max-w-lg bg-neutral-900/40 border-neutral-800/80 backdrop-blur-md overflow-hidden pt-6 shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500 absolute top-0 left-0" />
        <CardContent className="pt-8 flex flex-col items-center text-center">
          <div className="p-4 rounded-full bg-emerald-500/15 text-emerald-400 mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-pulse">
            <CheckCircle2Icon className="size-14" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Response Submitted!</h2>
          
          {submissionInfo?.formTitle ? (
            <p className="text-sm text-emerald-400/80 font-medium mb-3">
              Thank you for filling out &ldquo;{submissionInfo.formTitle}&rdquo;
            </p>
          ) : (
            <p className="text-sm text-emerald-400/80 font-medium mb-3">
              Thank you for your submission!
            </p>
          )}
          
          <p className="text-sm text-muted-foreground max-w-sm mb-8">
            Your response has been captured successfully. You can safely close this tab or submit another response.
          </p>

          {/* Quick summary */}
          {submissionInfo?.fields && submissionInfo?.data && submissionInfo.fields.length > 0 && (
            <div className="w-full text-left bg-neutral-950/50 rounded-xl border border-neutral-800/50 p-4 space-y-3.5 mb-6 max-h-60 overflow-y-auto">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800/80 pb-2 flex items-center gap-1.5">
                <FileTextIcon className="size-3.5 text-indigo-400" />
                Submitted Summary
              </div>
              {submissionInfo.fields.map((field) => {
                const val = submissionInfo.data[field.labelKey]
                let displayVal = val;
                if (field.type === 'MULTI_SELECT' && Array.isArray(val)) {
                   displayVal = val.join(', ')
                }

                return (
                  <div key={field.id} className="text-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-neutral-900/50 pb-2 last:border-0 last:pb-0">
                    <span className="font-medium text-neutral-300 truncate max-w-xs">{field.label}:</span>
                    <span className="text-neutral-400 bg-neutral-900/60 px-2 py-0.5 rounded text-xs border border-neutral-800/30 break-words max-w-xs text-right">
                      {field.type === "YES_NO" ? (val ? "Yes" : "No") : (displayVal || "—")}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              sessionStorage.removeItem(`formz_submission_${formId}`)
              router.push(`/form/${formId}`)
            }}
            className="text-neutral-400 border-neutral-800 hover:bg-neutral-800/60 hover:text-foreground flex items-center gap-2"
          >
            <ArrowLeftIcon className="size-4" />
            Fill out another response
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
