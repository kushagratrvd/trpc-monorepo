"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useForm, type SubmitHandler } from "react-hook-form"
import {
    useGetFields,
    useCreateField,
    useUpdateField,
    useDeleteField,
    useGetFormForEditor,
    useUpdateFormVisibility,
    useUpdateFormSettings,
    useUpdateForm,
} from "~/hooks/api/form"
import { Button } from "~/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "~/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select"
import { Switch } from "~/components/ui/switch"
import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"
import { Separator } from "~/components/ui/separator"
import {
    ArrowLeftIcon,
    PlusIcon,
    PencilIcon,
    Trash2Icon,
    InboxIcon,
    BarChart3Icon,
    ShareIcon,
    CopyIcon,
    AlertTriangleIcon,
    CheckIcon,
    LockIcon,
    PanelRightOpenIcon,
    PanelRightCloseIcon,
    SaveIcon,
    PaletteIcon,
    SettingsIcon,
    LayersIcon,
    XIcon,
} from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { toast } from "sonner"

const FIELD_TYPES = ["TEXT", "LONG_TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD", "SINGLE_SELECT", "MULTI_SELECT"] as const
type FieldType = (typeof FIELD_TYPES)[number]

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
    TEXT: "Short Text",
    LONG_TEXT: "Long Text",
    NUMBER: "Number",
    EMAIL: "Email",
    YES_NO: "Yes / No",
    PASSWORD: "Password",
    SINGLE_SELECT: "Single Select",
    MULTI_SELECT: "Multi Select",
}

type CreateFieldValues = {
    label: string
    type: FieldType
    description: string
    placeholder: string
    isRequired: boolean
    options: string
}

type EditFieldValues = {
    label: string
    type: FieldType
    description: string
    placeholder: string
    isRequired: boolean
    options: string
}

const THEMES = [
    { id: "none", label: "No Theme", preview: "bg-[#18181b]", bgImage: null },
    { id: "overworld", label: "Overworld", preview: "bg-gradient-to-b from-sky-400 to-green-500", bgImage: "linear-gradient(180deg, #38bdf8 0%, #22c55e 100%)" },
    { id: "nether", label: "Nether", preview: "bg-gradient-to-b from-red-900 to-orange-600", bgImage: "linear-gradient(180deg, #7f1d1d 0%, #ea580c 100%)" },
    { id: "end", label: "The End", preview: "bg-gradient-to-b from-purple-900 to-indigo-950", bgImage: "linear-gradient(180deg, #581c87 0%, #1e1b4b 100%)" },
    { id: "ocean", label: "Deep Ocean", preview: "bg-gradient-to-b from-blue-900 to-cyan-800", bgImage: "linear-gradient(180deg, #1e3a5f 0%, #155e75 100%)" },
    { id: "mesa", label: "Mesa", preview: "bg-gradient-to-b from-orange-800 to-yellow-700", bgImage: "linear-gradient(180deg, #9a3412 0%, #a16207 100%)" },
] as const

export default function FormBuilderPage({ params }: { params: Promise<{ id: string }>; }) {
    const { id: formId } = use(params);

    const { form: formData, isLoading: isFormLoading } = useGetFormForEditor(formId)
    const { fields, isLoading: isFieldsLoading } = useGetFields(formId)
    const { createFieldAsync, status: createStatus } = useCreateField(formId)
    const { updateFieldAsync, status: updateStatus } = useUpdateField(formId)
    const { deleteFieldAsync } = useDeleteField(formId)
    const { updateFormVisibilityAsync, status: visibilityUpdateStatus } = useUpdateFormVisibility(formId)
    const { updateFormSettingsAsync, status: settingsUpdateStatus } = useUpdateFormSettings(formId)
    const { updateFormAsync, status: updateFormStatus } = useUpdateForm(formId)

    const isLoading = isFormLoading || isFieldsLoading

    const [drawerOpen, setDrawerOpen] = useState(true)
    const [drawerTab, setDrawerTab] = useState<"edit" | "fields" | "theme">("edit")

    const [editTitle, setEditTitle] = useState("")
    const [editDescription, setEditDescription] = useState("")
    const [formDirty, setFormDirty] = useState(false)

    const [selectedTheme, setSelectedTheme] = useState("none")

    useEffect(() => {
        if (formData) {
            setEditTitle(formData.title)
            setEditDescription(formData.description || "")
        }
    }, [formData])

    useEffect(() => {
        if (formData) {
            const titleChanged = editTitle !== formData.title
            const descChanged = editDescription !== (formData.description || "")
            setFormDirty(titleChanged || descChanged)
        }
    }, [editTitle, editDescription, formData])

    const handleSaveForm = async () => {
        await updateFormAsync({
            formId,
            title: editTitle,
            description: editDescription || null,
        })
        toast.success("Form saved successfully")
    }

    const [settingsOpen, setSettingsOpen] = useState(false)
    const [passwordInput, setPasswordInput] = useState("")

    const handleSavePassword = async () => {
        await updateFormSettingsAsync({ formId, password: passwordInput || null })
        setSettingsOpen(false)
    }

    const openSettings = () => {
        setPasswordInput("")
        setSettingsOpen(true)
    }

    // Share dialog
    const [shareOpen, setShareOpen] = useState(false)
    const [hasCopied, setHasCopied] = useState(false)

    const absoluteUrl = typeof window !== 'undefined' ? `${window.location.origin}/form/${formId}` : ''

    const handleCopyLink = () => {
        if (!absoluteUrl) return
        navigator.clipboard.writeText(absoluteUrl).then(() => {
            setHasCopied(true)
            setTimeout(() => setHasCopied(false), 2000)
        })
    }

    // Create field dialog
    const [createOpen, setCreateOpen] = useState(false)
    const createForm = useForm<CreateFieldValues>({
        defaultValues: {
            label: "",
            type: "TEXT",
            description: "",
            placeholder: "",
            isRequired: false,
            options: "",
        },
    })

    const onCreateSubmit: SubmitHandler<CreateFieldValues> = async (data) => {
        const needsOptions = data.type === 'SINGLE_SELECT' || data.type === 'MULTI_SELECT';
        const parsedOptions = needsOptions && data.options.trim() ? data.options.split(',').map(o => o.trim()).filter(Boolean) : undefined;
        await createFieldAsync({
            formId,
            label: data.label,
            type: data.type,
            description: data.description || undefined,
            placeholder: data.placeholder || undefined,
            isRequired: data.isRequired,
            options: parsedOptions,
        })
        createForm.reset()
        setCreateOpen(false)
    }

    // Edit field dialog
    const [editOpen, setEditOpen] = useState(false)
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
    const editForm = useForm<EditFieldValues>({
        defaultValues: {
            label: "",
            type: "TEXT",
            description: "",
            placeholder: "",
            isRequired: false,
            options: "",
        },
    })

    const openEditDialog = (field: {
        id: string
        label: string
        type: FieldType
        description?: string | null
        placeholder?: string | null
        isRequired: boolean
        options?: string[] | null
    }) => {
        setEditingFieldId(field.id)
        editForm.reset({
            label: field.label,
            type: field.type,
            description: field.description ?? "",
            placeholder: field.placeholder ?? "",
            isRequired: field.isRequired,
            options: field.options ? field.options.join(', ') : "",
        })
        setEditOpen(true)
    }

    const onEditSubmit: SubmitHandler<EditFieldValues> = async (data) => {
        if (!editingFieldId) return
        const needsOptions = data.type === 'SINGLE_SELECT' || data.type === 'MULTI_SELECT';
        const parsedOptions = needsOptions && data.options.trim() ? data.options.split(',').map(o => o.trim()).filter(Boolean) : undefined;
        await updateFieldAsync({
            fieldId: editingFieldId,
            label: data.label,
            type: data.type,
            description: data.description || undefined,
            placeholder: data.placeholder || undefined,
            isRequired: data.isRequired,
            options: parsedOptions,
        })
        setEditOpen(false)
    }

    const isCreating = createStatus === "pending"
    const isUpdating = updateStatus === "pending"
    const isSaving = updateFormStatus === "pending"

    const currentTheme = THEMES.find(t => t.id === selectedTheme) ?? THEMES[0]

    return (
        <div className="flex flex-1 flex-col h-full">
            {/* Inline header */}
            <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#365314]/40 px-4 lg:px-6">
                <Button asChild size="md" variant="ghost">
                    <Link href="/dashboard/forms">
                        <ArrowLeftIcon className="size-4 mr-1" />
                        Back
                    </Link>
                </Button>
                <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
                <h1 className="text-base font-semibold text-white truncate">
                    {isFormLoading ? <Skeleton className="h-5 w-32" /> : formData?.title || "Form Builder"}
                </h1>

                <div className="ml-auto flex items-center gap-2">
                    {/* Visibility */}
                    <Select
                        value={formData?.visibility}
                        onValueChange={(val: any) => updateFormVisibilityAsync({ formId, visibility: val })}
                        disabled={visibilityUpdateStatus === 'pending' || isFormLoading}
                    >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue placeholder="Visibility" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="UNPUBLISHED">Draft</SelectItem>
                            <SelectItem value="PUBLIC">Public</SelectItem>
                            <SelectItem value="UNLISTED">Unlisted</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button asChild size="lg" variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800 h-8 text-sm">
                        <Link href={`/dashboard/forms/${formId}/analytics`}>
                            <BarChart3Icon className="size-3.5 mr-1 text-[#84cc16]" />
                            Analytics
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800 h-8 text-sm">
                        <Link href={`/dashboard/forms/${formId}/submissions`}>
                            <InboxIcon className="size-3.5 mr-1" />
                            Submissions
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800 h-8 text-sm cursor-pointer" onClick={() => setShareOpen(true)}>
                        <ShareIcon className="size-3.5 mr-1 text-emerald-400" />
                        Share
                    </Button>
                    <Button size="lg" variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800 h-8 text-sm cursor-pointer" onClick={openSettings}>
                        <LockIcon className={`size-3.5 mr-1 ${formData?.hasPassword ? 'text-amber-400' : 'text-slate-400'}`} />
                        Password
                    </Button>

                    {/* Drawer toggle */}
                    <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDrawerOpen(!drawerOpen)}
                        className="h-8 w-8 p-0"
                    >
                        {drawerOpen ? <PanelRightCloseIcon className="size-4" /> : <PanelRightOpenIcon className="size-4" />}
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Main content — Field list / Preview */}
                <div className="flex-1 overflow-y-auto p-6 min-w-0">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-muted-foreground">
                            {fields?.fields
                                ? `${fields.fields.length} field${fields.fields.length !== 1 ? "s" : ""}`
                                : "Loading..."}
                        </p>
                        <Button size="sm" onClick={() => { setDrawerTab("fields"); setDrawerOpen(true); setCreateOpen(true); }}>
                            <PlusIcon className="size-4 mr-1" />
                            Add Field
                        </Button>
                    </div>

                    {/* Form Preview with Theme */}
                    <div
                        className="rounded-sm border border-slate-800 p-6 min-h-[400px] transition-all"
                        style={{
                            background: currentTheme?.bgImage || undefined,
                            backgroundColor: currentTheme?.bgImage ? undefined : '#18181b',
                        }}
                    >
                        {/* Form header preview */}
                        <div className="max-w-2xl mx-auto">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-white mb-1">
                                    {editTitle || "Untitled Form"}
                                </h2>
                                {editDescription && (
                                    <p className="text-sm text-slate-300/80">{editDescription}</p>
                                )}
                            </div>

                            {/* Field list */}
                            <div className="space-y-3">
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="rounded-sm border border-white/10 p-4 bg-black/20 backdrop-blur-sm">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-5 w-32" />
                                                <Skeleton className="h-5 w-16" />
                                            </div>
                                            <Skeleton className="mt-2 h-4 w-48" />
                                        </div>
                                    ))
                                ) : fields?.fields && fields.fields.length > 0 ? (
                                    fields.fields.map((field) => (
                                        <div
                                            key={field.labelKey}
                                            className="group rounded-sm border border-white/10 p-4 transition-colors bg-black/20 backdrop-blur-sm hover:bg-black/30 hover:border-[#84cc16]/40"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-white">
                                                            {field.label}
                                                        </span>
                                                        <Badge variant="secondary" className="rounded-sm text-[10px]">
                                                            {FIELD_TYPE_LABELS[field.type as FieldType] ?? field.type}
                                                        </Badge>
                                                        {field.isRequired && (
                                                            <Badge variant="outline" className="text-[10px] rounded-sm font-semibold bg-red-500/10 text-red-400 border-red-500/20">
                                                                Required
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {field.description && (
                                                        <p className="text-sm text-slate-300/70 truncate">
                                                            {field.description}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-slate-400/50 mt-1 font-mono">
                                                        Key: <code className="rounded-sm bg-black/30 px-1.5 py-0.5 border border-white/10">{field.labelKey}</code>
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-white/80 hover:text-white"
                                                        onClick={() => openEditDialog(field as {
                                                            id: string
                                                            label: string
                                                            type: FieldType
                                                            description?: string | null
                                                            placeholder?: string | null
                                                            isRequired: boolean
                                                            options?: string[] | null
                                                        })}
                                                    >
                                                        <PencilIcon className="size-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => deleteFieldAsync({ fieldId: field.id })}
                                                    >
                                                        <Trash2Icon className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-sm border border-dashed border-white/20 p-8 text-center bg-black/20 backdrop-blur-sm">
                                        <p className="text-lg font-bold text-white/80 mb-1">No fields yet</p>
                                        <p className="text-sm text-slate-400">
                                            Click &ldquo;Add Field&rdquo; to start building your form.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Drawer */}
                {drawerOpen && (
                    <div className="w-80 shrink-0 border-l border-[#365314]/40 bg-[#18181b] overflow-y-auto">
                        {/* Drawer tabs */}
                        <div className="flex items-center border-b border-slate-800 px-2">
                            <button
                                className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium transition-colors border-b-2 ${
                                    drawerTab === "edit"
                                        ? "border-[#84cc16] text-[#84cc16]"
                                        : "border-transparent text-slate-400 hover:text-slate-200"
                                }`}
                                onClick={() => setDrawerTab("edit")}
                            >
                                <SettingsIcon className="size-4.5" />
                                Edit
                            </button>
                            <button
                                className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium transition-colors border-b-2 ${
                                    drawerTab === "fields"
                                        ? "border-[#84cc16] text-[#84cc16]"
                                        : "border-transparent text-slate-400 hover:text-slate-200"
                                }`}
                                onClick={() => setDrawerTab("fields")}
                            >
                                <LayersIcon className="size-4.5" />
                                Fields
                            </button>
                            <button
                                className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium transition-colors border-b-2 ${
                                    drawerTab === "theme"
                                        ? "border-[#84cc16] text-[#84cc16]"
                                        : "border-transparent text-slate-400 hover:text-slate-200"
                                }`}
                                onClick={() => setDrawerTab("theme")}
                            >
                                <PaletteIcon className="size-4.5" />
                                Theme
                            </button>
                        </div>

                        <div className="p-4">
                            {/* Edit Tab — Form title/description */}
                            {drawerTab === "edit" && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-400 mb-1.5 block">Title</label>
                                        <Input
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            placeholder="Form title"
                                            maxLength={55}
                                            className="text-sm"
                                        />
                                        <p className="text-[10px] text-slate-500 mt-1 text-right">{editTitle.length}/55</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-400 mb-1.5 block">Description</label>
                                        <Textarea
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            placeholder="Form description (optional)"
                                            rows={3}
                                            maxLength={300}
                                            className="text-sm"
                                        />
                                        <p className="text-[10px] text-slate-500 mt-1 text-right">{editDescription.length}/300</p>
                                    </div>
                                    <Button
                                        onClick={handleSaveForm}
                                        disabled={!formDirty || isSaving}
                                        className="w-full"
                                        size="sm"
                                    >
                                        <SaveIcon className="size-3.5 mr-1.5" />
                                        {isSaving ? "Saving..." : formDirty ? "Save Changes" : "No Changes"}
                                    </Button>
                                </div>
                            )}

                            {/* Fields Tab */}
                            {drawerTab === "fields" && (
                                <div className="space-y-3">
                                    <Button size="sm" onClick={() => setCreateOpen(true)} className="w-full">
                                        <PlusIcon className="size-4 mr-1" />
                                        Add Field
                                    </Button>
                                    <div className="space-y-2">
                                        {isLoading ? (
                                            Array.from({ length: 3 }).map((_, i) => (
                                                <div key={i} className="rounded-sm border border-slate-800 p-3">
                                                    <Skeleton className="h-4 w-24 mb-1" />
                                                    <Skeleton className="h-3 w-16" />
                                                </div>
                                            ))
                                        ) : fields?.fields && fields.fields.length > 0 ? (
                                            fields.fields.map((field) => (
                                                <div
                                                    key={field.labelKey}
                                                    className="rounded-sm border border-slate-800 p-3 hover:border-[#365314] transition-colors group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-slate-200 truncate">{field.label}</p>
                                                            <p className="text-[10px] text-slate-500">
                                                                {FIELD_TYPE_LABELS[field.type as FieldType] ?? field.type}
                                                                {field.isRequired && " • Required"}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 w-7 p-0"
                                                                onClick={() => openEditDialog(field as any)}
                                                            >
                                                                <PencilIcon className="size-3" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 w-7 p-0 text-destructive"
                                                                onClick={() => deleteFieldAsync({ fieldId: field.id })}
                                                            >
                                                                <Trash2Icon className="size-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-slate-500 text-center py-4">No fields yet</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Theme Tab — Frontend-only preview */}
                            {drawerTab === "theme" && (
                                <div className="space-y-3">
                                    <p className="text-xs text-slate-400">
                                        Choose a theme for your form&apos;s public page.
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {THEMES.map((theme) => (
                                            <button
                                                key={theme.id}
                                                onClick={() => setSelectedTheme(theme.id)}
                                                className={`rounded-sm border-2 p-3 text-center transition-all ${
                                                    selectedTheme === theme.id
                                                        ? "border-[#84cc16] ring-1 ring-[#84cc16]/30"
                                                        : "border-slate-700 hover:border-slate-600"
                                                }`}
                                            >
                                                <div className={`w-full h-10 rounded-sm mb-2 ${theme.preview}`} />
                                                <p className="text-[10px] font-medium text-slate-300">{theme.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-500 text-center mt-2">
                                        Theme saving coming soon — preview only for now
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Field Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Field</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={createForm.handleSubmit(onCreateSubmit)}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="create-label">Label</FieldLabel>
                                <Input
                                    id="create-label"
                                    placeholder="e.g. Full Name"
                                    {...createForm.register("label", {
                                        required: "Label is required",
                                        maxLength: {
                                            value: 55,
                                            message: "Label must be 55 characters or less",
                                        },
                                    })}
                                />
                                {createForm.formState.errors.label && (
                                    <p className="text-sm text-destructive">
                                        {createForm.formState.errors.label.message}
                                    </p>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel>Field Type</FieldLabel>
                                <Select
                                    value={createForm.watch("type")}
                                    onValueChange={(val) =>
                                        createForm.setValue("type", val as FieldType)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FIELD_TYPES.map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {FIELD_TYPE_LABELS[t]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            {(createForm.watch("type") === 'SINGLE_SELECT' || createForm.watch("type") === 'MULTI_SELECT') && (
                                <Field>
                                    <FieldLabel htmlFor="create-options">Options (comma separated)</FieldLabel>
                                    <Input
                                        id="create-options"
                                        placeholder="Option 1, Option 2, Option 3"
                                        {...createForm.register("options")}
                                    />
                                </Field>
                            )}

                            <Field>
                                <FieldLabel htmlFor="create-placeholder">Placeholder</FieldLabel>
                                <Input
                                    id="create-placeholder"
                                    placeholder="e.g. Enter your name"
                                    {...createForm.register("placeholder")}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="create-description">Description</FieldLabel>
                                <Textarea
                                    id="create-description"
                                    placeholder="Helper text shown below the field"
                                    rows={2}
                                    {...createForm.register("description")}
                                />
                            </Field>

                            <Field orientation="horizontal">
                                <FieldLabel>Required</FieldLabel>
                                <Switch
                                    checked={createForm.watch("isRequired")}
                                    onCheckedChange={(checked) =>
                                        createForm.setValue("isRequired", !!checked)
                                    }
                                />
                            </Field>
                        </FieldGroup>

                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateOpen(false)}
                                disabled={isCreating}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isCreating}>
                                {isCreating ? "Adding..." : "Add Field"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Field Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Field</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="edit-label">Label</FieldLabel>
                                <Input
                                    id="edit-label"
                                    placeholder="e.g. Full Name"
                                    {...editForm.register("label", {
                                        required: "Label is required",
                                        maxLength: {
                                            value: 55,
                                            message: "Label must be 55 characters or less",
                                        },
                                    })}
                                />
                                {editForm.formState.errors.label && (
                                    <p className="text-sm text-destructive">
                                        {editForm.formState.errors.label.message}
                                    </p>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel>Field Type</FieldLabel>
                                <Select
                                    value={editForm.watch("type")}
                                    onValueChange={(val) =>
                                        editForm.setValue("type", val as FieldType)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FIELD_TYPES.map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {FIELD_TYPE_LABELS[t]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            {(editForm.watch("type") === 'SINGLE_SELECT' || editForm.watch("type") === 'MULTI_SELECT') && (
                                <Field>
                                    <FieldLabel htmlFor="edit-options">Options (comma separated)</FieldLabel>
                                    <Input
                                        id="edit-options"
                                        placeholder="Option 1, Option 2, Option 3"
                                        {...editForm.register("options")}
                                    />
                                </Field>
                            )}

                            <Field>
                                <FieldLabel htmlFor="edit-placeholder">Placeholder</FieldLabel>
                                <Input
                                    id="edit-placeholder"
                                    placeholder="e.g. Enter your name"
                                    {...editForm.register("placeholder")}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="edit-description">Description</FieldLabel>
                                <Textarea
                                    id="edit-description"
                                    placeholder="Helper text shown below the field"
                                    rows={2}
                                    {...editForm.register("description")}
                                />
                            </Field>

                            <Field orientation="horizontal">
                                <FieldLabel>Required</FieldLabel>
                                <Switch
                                    checked={editForm.watch("isRequired")}
                                    onCheckedChange={(checked) =>
                                        editForm.setValue("isRequired", !!checked)
                                    }
                                />
                            </Field>
                        </FieldGroup>

                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditOpen(false)}
                                disabled={isUpdating}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Share Dialog */}
            <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Share Form</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center py-6 space-y-6">
                        {formData?.visibility === "UNPUBLISHED" && (
                            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 p-3 rounded-sm w-full font-mono">
                                <AlertTriangleIcon className="size-5 text-amber-500 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-500/90 leading-tight">
                                    <strong className="block text-amber-500 mb-1">Form is Unpublished!</strong>
                                    Respondents can open this link, but they cannot submit responses until you change visibility to Public or Unlisted.
                                </div>
                            </div>
                        )}
                        <div className="bg-white p-4 rounded-sm shadow-sm border-2 border-[#365314]">
                            <QRCodeCanvas
                                value={absoluteUrl}
                                size={180}
                                level={"H"}
                                fgColor={"#000000"}
                                bgColor={"#ffffff"}
                            />
                        </div>
                        <div className="w-full space-y-2">
                            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">Public Link</p>
                            <div className="flex items-center gap-2">
                                <Input
                                    readOnly
                                    value={absoluteUrl}
                                    className="bg-neutral-900 font-mono text-xs text-neutral-300"
                                />
                                <Button size="sm" onClick={handleCopyLink} className="shrink-0">
                                    {hasCopied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-end">
                        <Button type="button" variant="outline" onClick={() => setShareOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Settings/Password Dialog */}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Form Security</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <FieldLabel>Password Protection</FieldLabel>
                            <Input
                                type="text"
                                placeholder={formData?.hasPassword ? "Enter new password to overwrite..." : "Enter a password to lock form..."}
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                {formData?.hasPassword
                                    ? "This form is currently password protected. Leave blank and save to remove the password."
                                    : "Anyone with the link can view this form. Set a password to lock it."}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setSettingsOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleSavePassword} disabled={settingsUpdateStatus === 'pending'}>
                            {settingsUpdateStatus === 'pending' ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
