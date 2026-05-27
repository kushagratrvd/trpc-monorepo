"use client"

import { use, useState, useEffect, useRef } from "react"
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
import { CheckCircle2Icon, AlertCircleIcon, FileTextIcon, HelpCircleIcon, LockIcon, ArrowRightIcon, ChevronRightIcon, ChevronLeftIcon } from "lucide-react"
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
  const totalSteps = fieldsToRender.length

  const [currentStep, setCurrentStep] = useState(-1)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onChange" })

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

  // Global Keyboard listener for Next/Submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        const activeTag = document.activeElement?.tagName
        if (activeTag === "TEXTAREA") return
        e.preventDefault()
        if (currentStep < totalSteps) {
          handleNext()
        } else if (currentStep === totalSteps) {
          handleSubmit(onSubmit)()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentStep, totalSteps, fieldsToRender])

  const handleNext = async () => {
    if (currentStep === -1) {
      setCurrentStep(0)
      return
    }
    const currentField = fieldsToRender[currentStep]
    if (currentField) {
      const isValid = await trigger(currentField.labelKey)
      if (isValid) {
        setCurrentStep((prev) => prev + 1)
      }
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(-1, prev - 1))
  }

  const onSubmit = async (data: Record<string, any>) => {
    if (!form) return

    // Honeypot spam protection
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
      case "NUMBER": return "number"
      case "EMAIL": return "email"
      case "PASSWORD": return "password"
      default: return "text"
    }
  }

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
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

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

  const combinedThemes = getCombinedThemes(apiThemes)
  const currentTheme = combinedThemes.find(t => t.id === form?.theme) ?? combinedThemes[0]
  
  const progressPercent = Math.min(Math.round(((currentStep + 1) / (totalSteps + 1)) * 100), 100)
  const activeField = currentStep >= 0 && currentStep < totalSteps ? fieldsToRender[currentStep] : null

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden transition-all duration-700"
      style={{
          backgroundImage: currentTheme?.bgImage || undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: currentTheme?.bgImage ? undefined : '#0f172a',
      }}
    >
      <Card className="relative w-full max-w-2xl bg-[#18181b]/95 backdrop-blur-md border-2 border-[#365314] overflow-hidden pt-6 shadow-2xl rounded-sm transition-all duration-300">
        <div className="h-1.5 w-full bg-[#84cc16] absolute top-0 left-0" />
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Honeypot field */}
          <div
            aria-hidden="true"
            className="absolute opacity-0 pointer-events-none -z-10 overflow-hidden h-0 w-0"
            style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
          >
            <label htmlFor="__hp_website">Website</label>
            <input id="__hp_website" type="text" tabIndex={-1} autoComplete="off" {...register("__hp_website")} />
          </div>

          <CardContent className="pt-6 min-h-[300px] flex flex-col justify-center">
            
            {/* Step -1: Welcome Screen */}
            {currentStep === -1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 text-center py-8">
                <div className="inline-flex px-3 py-1 rounded-sm border-2 border-[#84cc16]/30 bg-[#84cc16]/10 text-[10px] uppercase font-bold tracking-widest text-[#84cc16] mb-2">
                  Formz Multi-Page
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  {form.title}
                </h1>
                {form.description && (
                  <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                    {form.description}
                  </p>
                )}
                
                <div className="pt-8">
                  {totalSteps === 0 ? (
                    <p className="text-sm text-slate-500 border-2 border-dashed border-slate-800 p-4 rounded-sm">This form has no questions yet.</p>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="group h-12 px-8 text-sm font-bold bg-[#84cc16] hover:bg-[#65a30d] text-slate-950 border-2 border-[#365314] rounded-sm transition-all active:translate-y-0.5"
                    >
                      Start Form
                      <ArrowRightIcon className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Steps 0 to N-1: Active Question */}
            {activeField && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-300 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 font-mono tracking-wider">
                    <span>Question {currentStep + 1} of {totalSteps}</span>
                    {activeField.isRequired ? (
                      <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-sm border border-amber-500/20">Required</span>
                    ) : (
                      <span className="text-slate-500 border border-slate-700 px-2 py-0.5 rounded-sm">Optional</span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {activeField.label}
                  </h2>
                  {activeField.description && (
                    <p className="text-sm text-slate-400">{activeField.description}</p>
                  )}
                </div>

                <div className="pt-4 border-t-2 border-slate-900/50">
                  <div className="min-h-[100px]">
                    {/* Render specific field type */}
                    {activeField.type === "YES_NO" && (
                      <Field orientation="horizontal" className="justify-between items-center py-4 border-2 border-slate-800 hover:border-[#365314] bg-slate-950/40 px-5 rounded-sm transition-all cursor-pointer">
                        <FieldLabel className="text-base font-bold cursor-pointer text-slate-200">
                          {activeField.label}
                        </FieldLabel>
                        <Controller
                          control={control}
                          name={activeField.labelKey}
                          defaultValue={false}
                          render={({ field: { value, onChange } }) => (
                            <Switch id={activeField.labelKey} checked={!!value} onCheckedChange={onChange} className="scale-125 origin-right" />
                          )}
                        />
                      </Field>
                    )}

                    {activeField.type === "LONG_TEXT" && (
                      <Textarea
                        autoFocus
                        placeholder={activeField.placeholder ?? "Type your answer..."}
                        className={`bg-slate-950/50 border-2 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:border-[#84cc16] focus-visible:ring-0 p-4 text-base rounded-sm ${errors[activeField.labelKey] ? 'border-destructive focus-visible:border-destructive' : ''}`}
                        rows={4}
                        {...register(activeField.labelKey, {
                          required: activeField.isRequired ? `${activeField.label} is required` : false,
                        })}
                      />
                    )}

                    {activeField.type === "SINGLE_SELECT" && (
                      <Controller
                        control={control}
                        name={activeField.labelKey}
                        rules={{ required: activeField.isRequired ? `${activeField.label} is required` : false }}
                        render={({ field: { value, onChange } }) => (
                          <RadioGroup onValueChange={onChange} value={value} className="grid gap-3">
                            {activeField.options?.map((option: string) => (
                              <label key={option} className={`flex items-center p-4 border-2 rounded-sm cursor-pointer transition-all ${value === option ? 'border-[#84cc16] bg-[#84cc16]/10' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'}`}>
                                <RadioGroupItem value={option} id={`${activeField.labelKey}-${option}`} className="mr-3 border-2 border-slate-600 text-[#84cc16]" />
                                <span className="text-sm font-bold text-slate-200">{option}</span>
                              </label>
                            ))}
                          </RadioGroup>
                        )}
                      />
                    )}

                    {activeField.type === "MULTI_SELECT" && (
                      <Controller
                        control={control}
                        name={activeField.labelKey}
                        defaultValue={[]}
                        rules={{
                          validate: (val) => {
                            if (activeField.isRequired && (!val || val.length === 0)) return `${activeField.label} is required`
                            return true
                          }
                        }}
                        render={({ field: { value, onChange } }) => (
                          <div className="grid gap-3">
                            {activeField.options?.map((option: string) => {
                              const checked = value?.includes(option)
                              return (
                                <label key={option} className={`flex items-center p-4 border-2 rounded-sm cursor-pointer transition-all ${checked ? 'border-[#84cc16] bg-[#84cc16]/10' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'}`}>
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(isChecked) => {
                                      const newValue = isChecked
                                        ? [...(value || []), option]
                                        : (value || []).filter((v: string) => v !== option);
                                      onChange(newValue);
                                    }}
                                    className="mr-3 border-2 border-slate-600 data-[state=checked]:bg-[#84cc16] data-[state=checked]:border-[#84cc16] rounded-sm"
                                  />
                                  <span className="text-sm font-bold text-slate-200">{option}</span>
                                </label>
                              )
                            })}
                          </div>
                        )}
                      />
                    )}

                    {["TEXT", "NUMBER", "EMAIL", "PASSWORD"].includes(activeField.type) && (
                      <Input
                        autoFocus
                        type={getInputType(activeField.type)}
                        placeholder={activeField.placeholder ?? "Type your answer..."}
                        className={`h-14 bg-slate-950/50 border-2 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:border-[#84cc16] focus-visible:ring-0 px-4 text-lg rounded-sm ${errors[activeField.labelKey] ? 'border-destructive focus-visible:border-destructive' : ''}`}
                        {...register(activeField.labelKey, {
                          required: activeField.isRequired ? `${activeField.label} is required` : false,
                          pattern: activeField.type === "EMAIL" ? {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Please enter a valid email address",
                          } : undefined,
                        })}
                      />
                    )}

                    {errors[activeField.labelKey] && (
                      <FieldError className="text-sm font-bold text-destructive mt-3 flex items-center gap-2 animate-fadeIn bg-destructive/10 p-2.5 border-2 border-destructive/20 rounded-sm">
                        <AlertCircleIcon className="size-4" />
                        {errors[activeField.labelKey]?.message as string}
                      </FieldError>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t-2 border-slate-900/50">
                  <Button type="button" variant="outline" onClick={handleBack} className="border-2 border-slate-700 hover:bg-slate-800 text-slate-300 rounded-sm h-10 px-4">
                    <ChevronLeftIcon className="size-4 mr-1" />
                    Back
                  </Button>
                  <Button type="button" onClick={handleNext} className="bg-[#84cc16] hover:bg-[#65a30d] text-slate-950 border-2 border-[#365314] font-bold rounded-sm h-10 px-6 active:translate-y-0.5 transition-all">
                    Next
                    <ChevronRightIcon className="size-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step N: Review & Submit */}
            {currentStep === totalSteps && totalSteps > 0 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <CheckCircle2Icon className="size-6 text-[#84cc16] mr-2" />
                    Review your answers
                  </h2>
                  <p className="text-sm text-slate-400 font-mono">
                    Click any row to jump back and edit it before submitting.
                  </p>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar border-y-2 border-slate-900/50 py-4">
                  {fieldsToRender.map((f, i) => {
                    const rawVal = getValues(f.labelKey)
                    let displayVal = "—"
                    if (rawVal !== undefined && rawVal !== null && rawVal !== "") {
                      if (f.type === "YES_NO") displayVal = rawVal ? "Yes" : "No"
                      else if (Array.isArray(rawVal)) displayVal = rawVal.length > 0 ? rawVal.join(", ") : "—"
                      else displayVal = String(rawVal)
                    }
                    return (
                      <div 
                        key={f.id} 
                        onClick={() => setCurrentStep(i)}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border-2 border-slate-800 bg-slate-950/30 hover:border-[#84cc16]/50 hover:bg-[#84cc16]/5 rounded-sm cursor-pointer transition-colors"
                      >
                        <span className="text-sm font-bold text-slate-400 group-hover:text-slate-300 max-w-[200px] truncate">
                          {i + 1}. {f.label}
                        </span>
                        <span className="text-sm font-mono font-bold text-slate-200 text-left sm:text-right max-w-full break-words sm:max-w-[300px]">
                          {displayVal}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {submitError && (
                  <div className="p-3.5 rounded-sm border-2 border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-start gap-2.5 animate-fadeIn">
                    <AlertCircleIcon className="size-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-bold text-destructive">Error:</span> {submitError}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Button type="button" variant="outline" onClick={handleBack} className="border-2 border-slate-700 hover:bg-slate-800 text-slate-300 rounded-sm h-12 px-6">
                    <ChevronLeftIcon className="size-4 mr-1" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 ml-4 h-12 text-sm font-bold bg-[#84cc16] hover:bg-[#65a30d] text-slate-950 border-2 border-[#365314] rounded-sm transition-all shadow-[0_0_20px_rgba(132,204,22,0.2)] hover:shadow-[0_0_30px_rgba(132,204,22,0.4)] active:translate-y-0.5"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Form"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-0 pb-6 flex flex-col items-center border-none">
            {/* Minimal Progress Bar */}
            <div className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-2">
              <span>{progressPercent}% Complete</span>
              <span>Step {Math.max(currentStep + 1, 0)} of {totalSteps}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-[#84cc16] transition-all duration-700 ease-in-out shadow-[0_0_10px_#84cc16]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
