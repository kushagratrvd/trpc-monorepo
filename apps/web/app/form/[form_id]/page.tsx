"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { useGetForm, useSubmitForm } from "~/hooks/api/form"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Switch } from "~/components/ui/switch"
import { Field, FieldLabel, FieldDescription, FieldError } from "~/components/ui/field"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"
import { Textarea } from "~/components/ui/textarea"
import { Checkbox } from "~/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { CheckCircle2Icon, AlertCircleIcon, FileTextIcon, HelpCircleIcon, LockIcon, ArrowRightIcon } from "lucide-react"
import { trpc } from "~/trpc/client"
import { getCombinedThemes } from "~/lib/themes"

type PublicFormPageProps = {
  params: Promise<{
    form_id: string
  }>
}

export default function PublicFormPage({ params }: PublicFormPageProps) {
  const { form_id: formId } = use(params)
  const router = useRouter()
  const { form, isLoading, error } = useGetForm(formId)
  const { data: apiThemes } = trpc.form.getAvailableThemes.useQuery()
  const { submitFormAsync } = useSubmitForm(formId)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const utils = trpc.useUtils()
  const [password, setPassword] = useState("")
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [unlockError, setUnlockError] = useState<string | null>(null)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [unlockedFields, setUnlockedFields] = useState<any[]>([])

  const fieldsToRender = isUnlocked ? unlockedFields : (form?.fields || [])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm()

  // Hydrate from draft
  useEffect(() => {
    const draft = sessionStorage.getItem(`draft_submission_${formId}`)
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        Object.keys(parsed).forEach(key => {
          if (parsed[key] !== undefined) {
            setValue(key, parsed[key])
          }
        })
      } catch (e) {
        console.error("Failed to parse draft", e)
      }
    }
  }, [formId, setValue])

  // Auto-save draft
  useEffect(() => {
    const subscription = watch((value) => {
      sessionStorage.setItem(`draft_submission_${formId}`, JSON.stringify(value))
    })
    return () => subscription.unsubscribe()
  }, [watch, formId])

  const onSubmit = async (data: Record<string, any>) => {
    if (!form) return

    // Honeypot spam protection: if the hidden field was filled, a bot submitted this.
    // Show fake success without actually saving anything.
    if (data.__hp_website) {
      await new Promise((r) => setTimeout(r, 800))
      
      sessionStorage.setItem(`formz_submission_${formId}`, JSON.stringify({
        formTitle: form.title,
        fields: fieldsToRender,
        data
      }))
      sessionStorage.removeItem(`draft_submission_${formId}`)
      router.push(`/form/${formId}/success`)
      return
    }

    setSubmitError(null)
    try {
      const submissionValues = fieldsToRender.map((field) => {
        const rawValue = data[field.labelKey]
        let stringValue = ""
        if (field.type === "YES_NO") {
          stringValue = rawValue ? "true" : "false"
        } else if (field.type === "MULTI_SELECT") {
          if (Array.isArray(rawValue)) {
            stringValue = JSON.stringify(rawValue);
          } else {
            stringValue = "[]"
          }
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
        password: isUnlocked ? password : undefined,
        values: submissionValues,
      })

      sessionStorage.setItem(`formz_submission_${formId}`, JSON.stringify({
        formTitle: form.title,
        fields: fieldsToRender,
        data
      }))
      
      sessionStorage.removeItem(`draft_submission_${formId}`)
      router.push(`/form/${formId}/success`)
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
      <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#0f172a] overflow-hidden">
        <Card className="relative w-full max-w-xl bg-[#18181b] border-2 border-[#365314] overflow-hidden pt-6 rounded-sm shadow-2xl">
          <div className="h-1.5 w-full bg-slate-800 absolute top-0 left-0 animate-pulse" />
          <CardHeader className="space-y-3">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </CardContent>
          <CardFooter className="pt-6">
            <Skeleton className="h-9 w-24" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Error State or Not Found
  if (error || !form) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#0f172a] overflow-hidden">
        <Card className="relative w-full max-w-md bg-[#18181b] border-2 border-destructive/50 overflow-hidden pt-6 text-center rounded-sm shadow-2xl">
          <div className="h-1.5 w-full bg-destructive absolute top-0 left-0" />
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="p-3.5 rounded-sm bg-destructive/10 text-destructive mb-4 animate-bounce border border-destructive/20">
              <AlertCircleIcon className="size-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-200 mb-2">Form Not Found</h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
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

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setUnlockError(null)
    setIsUnlocking(true)
    try {
      const res = await utils.form.getFields.fetch({ formId, password })
      setUnlockedFields(res.fields)
      setIsUnlocked(true)
    } catch (err: any) {
      setUnlockError(err.message || "Invalid password")
    } finally {
      setIsUnlocking(false)
    }
  }

  // Lock Screen State
  if (form && form.hasPassword && !isUnlocked) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#0f172a] overflow-hidden">
        <Card className="relative w-full max-w-md bg-[#18181b] border-2 border-[#365314] overflow-hidden pt-6 shadow-2xl rounded-sm">
          <div className="h-1.5 w-full bg-amber-500 absolute top-0 left-0" />
          <form onSubmit={handleUnlock}>
            <CardHeader className="text-center space-y-3 pb-2">
              <div className="mx-auto p-4 rounded-sm bg-amber-500/10 w-fit mb-2 border-2 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <LockIcon className="size-8 text-amber-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">{form.title}</CardTitle>
              <CardDescription className="text-sm text-slate-400">
                This form is password protected.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-neutral-950/50 border-2 border-slate-800 text-center text-lg h-12 focus-visible:border-amber-500 focus-visible:ring-[3px] focus-visible:ring-amber-500/20 rounded-sm font-mono"
                  autoFocus
                />
              </div>
              {unlockError && (
                <div className="text-sm text-destructive text-center font-medium bg-destructive/10 py-2 rounded-sm border-2 border-destructive/30 animate-fadeIn">
                  {unlockError}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isUnlocking || !password} className="w-full h-12 text-md font-semibold bg-amber-600 hover:bg-amber-500 border-2 border-amber-800 text-slate-950 active:translate-y-[2px] rounded-sm transition-all shadow-md">
                {isUnlocking ? "Verifying..." : "Unlock Form"}
                {!isUnlocking && <ArrowRightIcon className="size-4 ml-2" />}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  }

  // Determine theme
  const combinedThemes = getCombinedThemes(apiThemes)
  const currentTheme = combinedThemes.find(t => t.id === form?.theme) ?? combinedThemes[0]

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden transition-all"
      style={{
          backgroundImage: currentTheme?.bgImage || undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: currentTheme?.bgImage ? undefined : '#0f172a',
      }}
    >
      <Card className="relative w-full max-w-xl bg-[#18181b]/95 backdrop-blur-sm border-2 border-[#365314] overflow-hidden pt-6 shadow-2xl rounded-sm">
        {/* Dynamic Green Bar at Top */}
        <div className="h-1.5 w-full bg-[#84cc16] absolute top-0 left-0" />
        
        <CardHeader className="space-y-1.5 border-b-2 border-slate-950 pb-6">
          <CardTitle className="text-2xl font-bold text-white">
            {form.title}
          </CardTitle>
          {form.description && (
            <CardDescription className="text-sm text-slate-400 leading-relaxed">
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
            {fieldsToRender.length > 0 ? (
              fieldsToRender.map((field) => {
                const isYesNo = field.type === "YES_NO"

                if (isYesNo) {
                  return (
                    <Field key={field.id} orientation="horizontal" className="justify-between items-center py-3 border-2 border-slate-800 hover:border-[#365314] bg-slate-950/20 px-4 rounded-sm transition-all">
                      <div className="flex flex-col gap-1 pr-4">
                        <FieldLabel htmlFor={field.labelKey} className="text-sm font-bold leading-none cursor-pointer flex items-center text-slate-200">
                          {field.label}
                          {field.isRequired && (
                            <span className="text-destructive font-bold ml-1 font-mono" title="Required">*</span>
                          )}
                        </FieldLabel>
                        {field.description && (
                          <FieldDescription className="text-xs text-slate-400 mt-0.5 leading-normal font-mono">
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

                if (field.type === 'LONG_TEXT') {
                  return (
                    <Field key={field.id} className="space-y-2">
                      <FieldLabel htmlFor={field.labelKey} className="text-sm font-bold flex items-center text-slate-200">
                        {field.label}
                        {field.isRequired && <span className="text-destructive font-bold ml-1 font-mono" title="Required">*</span>}
                      </FieldLabel>
                      
                      <Textarea
                        id={field.labelKey}
                        placeholder={field.placeholder ?? undefined}
                        className={`bg-slate-950/30 border-2 border-slate-800 text-slate-100 placeholder:text-slate-650 focus-visible:border-[#84cc16] focus-visible:ring-[3px] focus-visible:ring-[#84cc16]/20 rounded-sm font-sans ${errors[field.labelKey] ? 'border-destructive focus-visible:border-destructive' : ''}`}
                        rows={4}
                        {...register(field.labelKey, {
                          required: field.isRequired ? `${field.label} is required` : false,
                        })}
                      />

                      {field.description && (
                        <FieldDescription className="text-xs text-slate-400 font-mono">
                          {field.description}
                        </FieldDescription>
                      )}

                      {errors[field.labelKey] && (
                        <FieldError className="text-xs font-semibold text-destructive mt-1 flex items-center gap-1 animate-fadeIn font-mono">
                          <AlertCircleIcon className="size-3.5" />
                          {errors[field.labelKey]?.message as string}
                        </FieldError>
                      )}
                    </Field>
                  )
                }

                if (field.type === 'SINGLE_SELECT') {
                  return (
                    <Field key={field.id} className="space-y-3">
                      <FieldLabel className="text-sm font-bold flex items-center text-slate-200">
                        {field.label}
                        {field.isRequired && <span className="text-destructive font-bold ml-1 font-mono" title="Required">*</span>}
                      </FieldLabel>
                      {field.description && <FieldDescription className="text-xs text-slate-400 font-mono">{field.description}</FieldDescription>}
                      
                      <Controller
                        control={control}
                        name={field.labelKey}
                        rules={{ required: field.isRequired ? `${field.label} is required` : false }}
                        render={({ field: { value, onChange } }) => (
                          <RadioGroup onValueChange={onChange} value={value} className="space-y-2">
                            {field.options?.map((option: string) => (
                              <div key={option} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`${field.labelKey}-${option}`} className="border-2 border-slate-800 text-[#84cc16] focus-visible:ring-[3px] focus-visible:ring-[#84cc16]/20" />
                                <label htmlFor={`${field.labelKey}-${option}`} className="text-sm font-medium leading-none cursor-pointer text-slate-350">
                                  {option}
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                      />
                      
                      {errors[field.labelKey] && (
                        <FieldError className="text-xs font-semibold text-destructive mt-1 flex items-center gap-1 animate-fadeIn font-mono">
                          <AlertCircleIcon className="size-3.5" />
                          {errors[field.labelKey]?.message as string}
                        </FieldError>
                      )}
                    </Field>
                  )
                }

                if (field.type === 'MULTI_SELECT') {
                  return (
                    <Field key={field.id} className="space-y-3">
                      <FieldLabel className="text-sm font-bold flex items-center text-slate-200">
                        {field.label}
                        {field.isRequired && <span className="text-destructive font-bold ml-1 font-mono" title="Required">*</span>}
                      </FieldLabel>
                      {field.description && <FieldDescription className="text-xs text-slate-400 font-mono">{field.description}</FieldDescription>}
                      
                      <Controller
                        control={control}
                        name={field.labelKey}
                        defaultValue={[]}
                        rules={{
                          validate: (val) => {
                            if (field.isRequired && (!val || val.length === 0)) return `${field.label} is required`
                            return true
                          }
                        }}
                        render={({ field: { value, onChange } }) => (
                          <div className="space-y-2">
                            {field.options?.map((option: string) => {
                              const checked = value?.includes(option);
                              return (
                                <div key={option} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${field.labelKey}-${option}`}
                                    checked={checked}
                                    onCheckedChange={(isChecked) => {
                                      const newValue = isChecked
                                        ? [...(value || []), option]
                                        : (value || []).filter((v: string) => v !== option);
                                      onChange(newValue);
                                    }}
                                    className="border-2 border-slate-800 data-[state=checked]:bg-[#84cc16] data-[state=checked]:border-[#365314] rounded-sm"
                                  />
                                  <label htmlFor={`${field.labelKey}-${option}`} className="text-sm font-medium leading-none cursor-pointer text-slate-350">
                                    {option}
                                  </label>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      />
                      
                      {errors[field.labelKey] && (
                        <FieldError className="text-xs font-semibold text-destructive mt-1 flex items-center gap-1 animate-fadeIn font-mono">
                          <AlertCircleIcon className="size-3.5" />
                          {errors[field.labelKey]?.message as string}
                        </FieldError>
                      )}
                    </Field>
                  )
                }

                return (
                  <Field key={field.id} className="space-y-2">
                    <FieldLabel htmlFor={field.labelKey} className="text-sm font-bold flex items-center text-slate-200">
                      {field.label}
                      {field.isRequired && (
                        <span className="text-destructive font-bold ml-1 font-mono" title="Required">*</span>
                      )}
                    </FieldLabel>
                    
                    <div className="relative">
                      <Input
                        id={field.labelKey}
                        type={getInputType(field.type)}
                        placeholder={field.placeholder ?? undefined}
                        className={`bg-slate-950/30 border-2 border-slate-800 text-slate-100 placeholder:text-slate-650 focus-visible:border-[#84cc16] focus-visible:ring-[3px] focus-visible:ring-[#84cc16]/20 rounded-sm font-sans ${errors[field.labelKey] ? 'border-destructive focus-visible:border-destructive' : ''}`}
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
                      <FieldDescription className="text-xs text-slate-400 font-mono">
                        {field.description}
                      </FieldDescription>
                    )}

                    {errors[field.labelKey] && (
                      <FieldError className="text-xs font-semibold text-destructive mt-1 flex items-center gap-1 animate-fadeIn font-mono">
                        <AlertCircleIcon className="size-3.5" />
                        {errors[field.labelKey]?.message as string}
                      </FieldError>
                    )}
                  </Field>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-[#365314]/50 rounded-sm bg-[#18181b]/55 p-6">
                <HelpCircleIcon className="size-10 text-slate-500 mb-3" />
                <h3 className="text-base font-bold text-slate-350 mb-1">Empty Form</h3>
                <p className="text-xs text-slate-450 max-w-xs leading-relaxed font-mono">
                  This form does not have any fields configured yet. Please check back later.
                </p>
              </div>
            )}

            {submitError && (
              <div className="p-3.5 rounded-sm border-2 border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-start gap-2.5 animate-fadeIn">
                <AlertCircleIcon className="size-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold text-destructive">Submission Error:</span> {submitError}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t-2 border-slate-950 pt-6 pb-6 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-mono">
              Never share passwords or sensitive information.
            </p>
            {fieldsToRender.length > 0 && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-xs px-6"
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
