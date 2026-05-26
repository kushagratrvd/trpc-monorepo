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
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#0f172a] overflow-hidden">
      <Card className="relative w-full max-w-lg bg-[#18181b] border-2 border-[#365314] overflow-hidden pt-6 shadow-2xl rounded-sm">
        <div className="h-1.5 w-full bg-[#84cc16] absolute top-0 left-0" />
        <CardContent className="pt-8 flex flex-col items-center text-center">
          <div className="p-4 rounded-sm bg-emerald-500/15 text-emerald-400 mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-pulse border-2 border-emerald-500/30">
            <CheckCircle2Icon className="size-14" />
          </div>
          <h2 className="text-2xl font-black font-pixel tracking-wide mb-2 text-white">Response Submitted!</h2>
          
          {submissionInfo?.formTitle ? (
            <p className="text-sm text-[#84cc16] font-bold font-mono uppercase tracking-wider mb-3">
              Thank you for filling out &ldquo;{submissionInfo.formTitle}&rdquo;
            </p>
          ) : (
            <p className="text-sm text-[#84cc16] font-bold font-mono uppercase tracking-wider mb-3">
              Thank you for your submission!
            </p>
          )}
          
          <p className="text-sm text-slate-400 max-w-sm mb-8 leading-relaxed">
            Your response has been captured successfully. You can safely close this tab or submit another response.
          </p>

          {/* Quick summary */}
          {submissionInfo?.fields && submissionInfo?.data && submissionInfo.fields.length > 0 && (
            <div className="w-full text-left bg-slate-950/50 rounded-sm border-2 border-slate-800 p-4 space-y-3.5 mb-6 max-h-60 overflow-y-auto font-mono text-xs">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b-2 border-slate-950 pb-2 flex items-center gap-1.5">
                <FileTextIcon className="size-3.5 text-[#84cc16]" />
                Submitted Summary
              </div>
              {submissionInfo.fields.map((field) => {
                const val = submissionInfo.data[field.labelKey]
                let displayVal = val;
                if (field.type === 'MULTI_SELECT' && Array.isArray(val)) {
                   displayVal = val.join(', ')
                 }

                return (
                  <div key={field.id} className="text-xs flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-slate-900 pb-2 last:border-0 last:pb-0">
                    <span className="font-bold text-slate-350 truncate max-w-xs">{field.label}:</span>
                    <span className="text-slate-450 bg-slate-950/60 px-2 py-0.5 rounded-sm border border-slate-800 break-words max-w-xs text-right">
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
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider"
          >
            <ArrowLeftIcon className="size-4" />
            Fill out another response
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
