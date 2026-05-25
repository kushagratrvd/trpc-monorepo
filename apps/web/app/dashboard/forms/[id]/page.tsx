"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useForm, type SubmitHandler } from "react-hook-form"
import {
    useGetFields,
    useCreateField,
    useUpdateField,
    useDeleteField,
    useGetFormForEditor,
    useUpdateFormVisibility,
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
import {
    ArrowLeftIcon,
    PlusIcon,
    PencilIcon,
    Trash2Icon,
    InboxIcon,
    BarChart3Icon,
} from "lucide-react"

const FIELD_TYPES = ["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"] as const
type FieldType = (typeof FIELD_TYPES)[number]

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
    TEXT: "Text",
    NUMBER: "Number",
    EMAIL: "Email",
    YES_NO: "Yes / No",
    PASSWORD: "Password",
}

type CreateFieldValues = {
    label: string
    type: FieldType
    description: string
    placeholder: string
    isRequired: boolean
}

type EditFieldValues = {
    label: string
    type: FieldType
    description: string
    placeholder: string
    isRequired: boolean
}

export default function FormBuilderPage({ params }: { params: Promise<{ id: string }>; }) {
    const { id: formId } = use(params);

    const { form: formData, isLoading: isFormLoading } = useGetFormForEditor(formId)
    const { fields, isLoading: isFieldsLoading } = useGetFields(formId)
    const { createFieldAsync, status: createStatus } = useCreateField(formId)
    const { updateFieldAsync, status: updateStatus } = useUpdateField(formId)
    const { deleteFieldAsync } = useDeleteField(formId)
    const { updateFormVisibilityAsync, status: visibilityUpdateStatus } = useUpdateFormVisibility(formId)

    const isLoading = isFormLoading || isFieldsLoading

    const [createOpen, setCreateOpen] = useState(false)
    const createForm = useForm<CreateFieldValues>({
        defaultValues: {
            label: "",
            type: "TEXT",
            description: "",
            placeholder: "",
            isRequired: false,
        },
    })

    const onCreateSubmit: SubmitHandler<CreateFieldValues> = async (data) => {
        await createFieldAsync({
            formId,
            label: data.label,
            type: data.type,
            description: data.description || undefined,
            placeholder: data.placeholder || undefined,
            isRequired: data.isRequired,
        })
        createForm.reset()
        setCreateOpen(false)
    }

    const [editOpen, setEditOpen] = useState(false)
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
    const editForm = useForm<EditFieldValues>({
        defaultValues: {
            label: "",
            type: "TEXT",
            description: "",
            placeholder: "",
            isRequired: false,
        },
    })

    const openEditDialog = (field: {
        id: string
        label: string
        type: FieldType
        description?: string | null
        placeholder?: string | null
        isRequired: boolean
    }) => {
        setEditingFieldId(field.id)
        editForm.reset({
            label: field.label,
            type: field.type,
            description: field.description ?? "",
            placeholder: field.placeholder ?? "",
            isRequired: field.isRequired,
        })
        setEditOpen(true)
    }

    const onEditSubmit: SubmitHandler<EditFieldValues> = async (data) => {
        if (!editingFieldId) return
        await updateFieldAsync({
            fieldId: editingFieldId,
            label: data.label,
            type: data.type,
            description: data.description || undefined,
            placeholder: data.placeholder || undefined,
            isRequired: data.isRequired,
        })
        setEditOpen(false)
    }

    const isCreating = createStatus === "pending"
    const isUpdating = updateStatus === "pending"

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button asChild size="sm" variant="ghost">
                    <Link href="/dashboard/forms">
                        <ArrowLeftIcon className="size-4 mr-1" />
                        Back
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Form Builder</h1>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                    {fields?.fields
                        ? `${fields.fields.length} field${fields.fields.length !== 1 ? "s" : ""}`
                        : "Loading..."}
                </p>
                <div className="flex items-center gap-2">
                    <Select 
                        value={formData?.visibility} 
                        onValueChange={(val: any) => updateFormVisibilityAsync({ formId, visibility: val })}
                        disabled={visibilityUpdateStatus === 'pending' || isFormLoading}
                    >
                        <SelectTrigger className="w-[140px] h-9">
                            <SelectValue placeholder="Visibility" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="UNPUBLISHED">Draft</SelectItem>
                            <SelectItem value="PUBLIC">Public</SelectItem>
                            <SelectItem value="UNLISTED">Unlisted</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button asChild size="sm" variant="outline" className="border-neutral-800 text-neutral-350 hover:bg-neutral-800 bg-neutral-900/40">
                        <Link href={`/dashboard/forms/${formId}/analytics`}>
                            <BarChart3Icon className="size-4 mr-1.5 text-indigo-400" />
                            Analytics
                        </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="border-neutral-800 text-neutral-350 hover:bg-neutral-800">
                        <Link href={`/dashboard/forms/${formId}/submissions`}>
                            <InboxIcon className="size-4 mr-1.5" />
                            Submissions
                        </Link>
                    </Button>
                    <Button size="sm" onClick={() => setCreateOpen(true)}>
                        <PlusIcon className="size-4 mr-1" />
                        Add Field
                    </Button>
                </div>
            </div>

            {/* Field list */}
            <div className="space-y-3">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-lg border p-4">
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
                            className="group rounded-lg border p-4 transition-colors hover:bg-muted/50"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium truncate">
                                            {field.label}
                                        </span>
                                        <Badge variant="secondary">
                                            {FIELD_TYPE_LABELS[field.type as FieldType] ?? field.type}
                                        </Badge>
                                        {field.isRequired && (
                                            <Badge variant="outline" className="text-xs">
                                                Required
                                            </Badge>
                                        )}
                                    </div>
                                    {field.description && (
                                        <p className="text-sm text-muted-foreground truncate">
                                            {field.description}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground/60 mt-1">
                                        Key: <code className="rounded bg-muted px-1 py-0.5">{field.labelKey}</code>
                                    </p>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => openEditDialog(field as {
                                            id: string
                                            label: string
                                            type: FieldType
                                            description?: string | null
                                            placeholder?: string | null
                                            isRequired: boolean
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
                    <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                        <p className="text-lg font-medium mb-1">No fields yet</p>
                        <p className="text-sm">
                            Click &ldquo;Add Field&rdquo; to start building your form.
                        </p>
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
        </div>
    )
}
