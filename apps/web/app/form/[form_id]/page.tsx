"use client"

import { use, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { useGetForm, useSubmitForm } from "~/hooks/api/form"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Switch } from "~/components/ui/switch"
import { Field, FieldLabel, FieldDescription, FieldError } from "~/components/ui/field"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"
import { CheckCircle2Icon, AlertCircleIcon, FileTextIcon, HelpCircleIcon } from "lucide-react"

type PublicFormPageProps = {
  params: Promise<{
    form_id: string
  }>
}

export default function PublicFormPage({ params }: PublicFormPageProps) {
  const { form_id: formId } = use(params)
  const { form, isLoading, error } = useGetForm(formId)
  const { submitFormAsync } = useSubmitForm(formId)
  const [submitted, setSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState<Record<string, any> | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (data: Record<string, any>) => {
    if (!form) return

    // Honeypot spam protection: if the hidden field was filled, a bot submitted this.
    // Show fake success without actually saving anything.
    if (data.__hp_website) {
      await new Promise((r) => setTimeout(r, 800))
      setSubmittedData(data)
      setSubmitted(true)
      return
    }

    setSubmitError(null)
    try {
      const submissionValues = form.fields.map((field) => {
        const rawValue = data[field.labelKey]
        let stringValue = ""
        if (field.type === "YES_NO") {
          stringValue = rawValue ? "true" : "false"
        } else if (rawValue !== undefined && rawValue !== null) {
          stringValue = String(rawValue)
        }
        return {
          formFieldId: field.id,
          value: stringValue,
        }
      })

      await submitFormAsync({
        formId,
        values: submissionValues,
      })

      setSubmittedData(data)
      setSubmitted(true)
    } catch (err: any) {
      console.error("Submission failed:", err)
      setSubmitError(err?.message || "An unexpected error occurred during submission. Please try again.")
    }
  }

  const getInputType = (type: string) => {
    switch (type) {
      case "NUMBER":
        return "number"
      case "EMAIL":
        return "email"
      case "PASSWORD":
        return "password"
      default:
        return "text"
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 bg-neutral-950 overflow-hidden">
        {/* Neon Glow Blobs */}
        <div className="absolute top-1/4 -left-12 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <Card className="relative w-full max-w-xl bg-neutral-900/40 border-neutral-800/80 backdrop-blur-md overflow-hidden pt-6">
          <div className="h-1.5 w-full bg-neutral-800 absolute top-0 left-0 animate-pulse" />
          <CardHeader className="space-y-3">
            <Skeleton className="h-7 w-3/4 bg-neutral-800" />
            <Skeleton className="h-4 w-5/6 bg-neutral-800" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/4 bg-neutral-800" />
                <Skeleton className="h-9 w-full bg-neutral-800" />
                <Skeleton className="h-3 w-1/2 bg-neutral-800" />
              </div>
            ))}
          </CardContent>
          <CardFooter className="pt-6">
            <Skeleton className="h-9 w-24 bg-neutral-800" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Error State or Not Found
  if (error || !form) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 bg-neutral-950 overflow-hidden">
        <div className="absolute top-1/4 -left-12 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-12 w-80 h-80 bg-neutral-500/5 rounded-full blur-3xl pointer-events-none" />

        <Card className="relative w-full max-w-md bg-neutral-900/40 border-neutral-800/80 backdrop-blur-md overflow-hidden pt-6 text-center">
          <div className="h-1.5 w-full bg-destructive absolute top-0 left-0" />
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="p-3.5 rounded-full bg-destructive/10 text-destructive mb-4 animate-bounce">
              <AlertCircleIcon className="size-10" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
            <p className="text-sm text-muted-foreground mb-6">
              The form you are looking for does not exist, has been disabled, or the link is incorrect.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry Loading
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success State
  if (submitted) {
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
            <h2 className="text-2xl font-bold tracking-tight mb-2">Response Submitted!</h2>
            <p className="text-sm text-emerald-400/80 font-medium mb-3">
              Thank you for filling out &ldquo;{form.title}&rdquo;
            </p>
            <p className="text-sm text-muted-foreground max-w-sm mb-8">
              Your submission has been captured successfully. You can close this tab or fill out the form again.
            </p>

            {/* Quick summary of submitted values */}
            <div className="w-full text-left bg-neutral-950/50 rounded-xl border border-neutral-800/50 p-4 space-y-3.5 mb-6 max-h-60 overflow-y-auto">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800/80 pb-2 flex items-center gap-1.5">
                <FileTextIcon className="size-3.5 text-indigo-400" />
                Submitted Summary
              </div>
              {form.fields.map((field) => {
                const val = submittedData?.[field.labelKey]
                return (
                  <div key={field.id} className="text-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-neutral-900/50 pb-2 last:border-0 last:pb-0">
                    <span className="font-medium text-neutral-300 truncate max-w-xs">{field.label}:</span>
                    <span className="text-neutral-400 bg-neutral-900/60 px-2 py-0.5 rounded text-xs border border-neutral-800/30">
                      {field.type === "YES_NO" ? (val ? "Yes" : "No") : val || "—"}
                    </span>
                  </div>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSubmitted(false)
                setSubmittedData(null)
              }}
              className="text-neutral-400 border-neutral-800 hover:bg-neutral-800/60 hover:text-foreground"
            >
              Fill out another response
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-neutral-950 overflow-hidden">
      {/* Premium Background Glow effects */}
      <div className="absolute top-1/4 -left-12 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="relative w-full max-w-xl bg-neutral-900/40 border-neutral-800/80 backdrop-blur-md overflow-hidden pt-6 shadow-2xl transition-all hover:border-neutral-700/50">
        {/* Dynamic Gradient Bar at Top */}
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 absolute top-0 left-0" />
        
        <CardHeader className="space-y-1.5 border-b border-neutral-850 pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {form.title}
          </CardTitle>
          {form.description && (
            <CardDescription className="text-sm text-muted-foreground leading-relaxed">
              {form.description}
            </CardDescription>
          )}
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Honeypot field — invisible to humans, bots auto-fill it */}
          <div
            aria-hidden="true"
            className="absolute opacity-0 pointer-events-none -z-10 overflow-hidden h-0 w-0"
            style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
          >
            <label htmlFor="__hp_website">Website</label>
            <input
              id="__hp_website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...register("__hp_website")}
            />
          </div>

          <CardContent className="pt-6 space-y-6">
            {form.fields.length > 0 ? (
              form.fields.map((field) => {
                const isYesNo = field.type === "YES_NO"

                if (isYesNo) {
                  return (
                    <Field key={field.id} orientation="horizontal" className="justify-between items-center py-2.5 border border-neutral-800/40 hover:border-neutral-800/80 bg-neutral-950/20 px-4 rounded-xl transition-all">
                      <div className="flex flex-col gap-1 pr-4">
                        <FieldLabel htmlFor={field.labelKey} className="text-sm font-medium leading-none cursor-pointer flex items-center">
                          {field.label}
                          {field.isRequired && (
                            <span className="text-destructive font-bold ml-1" title="Required">*</span>
                          )}
                        </FieldLabel>
                        {field.description && (
                          <FieldDescription className="text-xs text-muted-foreground mt-0.5 leading-normal">
                            {field.description}
                          </FieldDescription>
                        )}
                      </div>
                      <Controller
                        control={control}
                        name={field.labelKey}
                        defaultValue={false}
                        render={({ field: { value, onChange } }) => (
                          <Switch
                            id={field.labelKey}
                            checked={!!value}
                            onCheckedChange={onChange}
                          />
                        )}
                      />
                    </Field>
                  )
                }

                return (
                  <Field key={field.id} className="space-y-2">
                    <FieldLabel htmlFor={field.labelKey} className="text-sm font-medium flex items-center">
                      {field.label}
                      {field.isRequired && (
                        <span className="text-destructive font-bold ml-1" title="Required">*</span>
                      )}
                    </FieldLabel>
                    
                    <div className="relative">
                      <Input
                        id={field.labelKey}
                        type={getInputType(field.type)}
                        placeholder={field.placeholder ?? undefined}
                        className={`bg-neutral-950/30 border-neutral-800 text-foreground transition-all duration-200 placeholder:text-neutral-600 focus:border-indigo-500/70 focus:ring-indigo-500/20 ${errors[field.labelKey] ? 'border-destructive/60 focus:border-destructive' : ''}`}
                        {...register(field.labelKey, {
                          required: field.isRequired ? `${field.label} is required` : false,
                          pattern: field.type === "EMAIL" ? {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Please enter a valid email address",
                          } : undefined,
                        })}
                      />
                    </div>

                    {field.description && (
                      <FieldDescription className="text-xs text-muted-foreground">
                        {field.description}
                      </FieldDescription>
                    )}

                    {errors[field.labelKey] && (
                      <FieldError className="text-xs font-medium text-destructive mt-1 flex items-center gap-1 animate-fadeIn">
                        <AlertCircleIcon className="size-3.5" />
                        {errors[field.labelKey]?.message as string}
                      </FieldError>
                    )}
                  </Field>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-950/15">
                <HelpCircleIcon className="size-10 text-neutral-600 mb-3" />
                <h3 className="text-base font-semibold text-neutral-400 mb-1">Empty Form</h3>
                <p className="text-sm text-neutral-500 max-w-xs">
                  This form does not have any fields configured yet. Please check back later.
                </p>
              </div>
            )}

            {submitError && (
              <div className="p-3.5 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm flex items-start gap-2.5 animate-fadeIn">
                <AlertCircleIcon className="size-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold text-destructive">Submission Error:</span> {submitError}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t border-neutral-850/80 pt-6 pb-6 flex items-center justify-between">
            <p className="text-xs text-neutral-500">
              Never share passwords or sensitive information.
            </p>
            {form.fields.length > 0 && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 text-foreground hover:bg-indigo-500 font-semibold px-6 shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-200"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
