"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useCreateForm, useListForms } from "~/hooks/api/form"
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
import { Badge } from "~/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table"
import { Skeleton } from "~/components/ui/skeleton"

type CreateFormValues = {
    title: string;
    description: string;
    visibility: "PUBLIC" | "UNLISTED" | "UNPUBLISHED";
}

export default function FormsPage() {
    const [open, setOpen] = useState(false)

    const { createFormAsync, status } = useCreateForm()
    const { forms, isLoading } = useListForms()

    const form = useForm<CreateFormValues>({
        defaultValues: {
            title: "",
            description: "",
            visibility: "UNPUBLISHED",
        },
    })

    // Hydrate draft
    useEffect(() => {
        const draft = sessionStorage.getItem("draft_new_form")
        if (draft) {
            try {
                const parsed = JSON.parse(draft)
                if (parsed.title) form.setValue("title", parsed.title)
                if (parsed.description) form.setValue("description", parsed.description)
                if (parsed.visibility) form.setValue("visibility", parsed.visibility)
            } catch (e) {
                console.error("Failed to parse form draft", e)
            }
        }
    }, [form.setValue])

    // Auto-save draft
    useEffect(() => {
        const subscription = form.watch((value) => {
            sessionStorage.setItem("draft_new_form", JSON.stringify(value))
        })
        return () => subscription.unsubscribe()
    }, [form.watch])

    const onSubmit: SubmitHandler<CreateFormValues> = async (data) => {
        await createFormAsync({
            title: data.title,
            description: data.description || undefined,
            visibility: data.visibility,
        })
        sessionStorage.removeItem("draft_new_form")
        form.reset()
        setOpen(false)
    }

    const isSubmitting = status === "pending"

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Forms</h1>
                <Button onClick={() => setOpen(true)}>Create Form</Button>
            </div>

            {/* Forms Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Visibility</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : forms && forms.length > 0 ? (
                            forms.map((f) => (
                                <TableRow key={f.id}>
                                    <TableCell className="font-medium">{f.title}</TableCell>
                                    <TableCell>
                                        <Badge variant={f.visibility === 'PUBLIC' ? 'default' : f.visibility === 'UNLISTED' ? 'secondary' : 'outline'}>
                                            {f.visibility === 'PUBLIC' ? 'Public' : f.visibility === 'UNLISTED' ? 'Unlisted' : 'Draft'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground max-w-xs truncate">
                                        {f.description || "—"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {f.createdAt
                                            ? new Date(f.createdAt).toLocaleDateString()
                                            : "—"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild size="sm" variant="outline">
                                            <Link href={`/dashboard/forms/${f.id}`}>
                                                Edit
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No forms yet. Create one to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create Form Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Form</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="title">Title</FieldLabel>
                                <Input
                                    id="title"
                                    placeholder="Enter form title"
                                    {...form.register("title", {
                                        required: "Title is required",
                                        maxLength: {
                                            value: 55,
                                            message: "Title must be 55 characters or less",
                                        },
                                    })}
                                />
                                {form.formState.errors.title && (
                                    <p className="text-sm text-destructive">
                                        {form.formState.errors.title.message}
                                    </p>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="description">Description</FieldLabel>
                                <Textarea
                                    id="description"
                                    placeholder="Enter form description (optional)"
                                    rows={3}
                                    {...form.register("description", {
                                        maxLength: {
                                            value: 300,
                                            message: "Description must be 300 characters or less",
                                        },
                                    })}
                                />
                                {form.formState.errors.description && (
                                    <p className="text-sm text-destructive">
                                        {form.formState.errors.description.message}
                                    </p>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel>Visibility</FieldLabel>
                                <Select
                                    value={form.watch("visibility")}
                                    onValueChange={(val: any) => form.setValue("visibility", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select visibility" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="UNPUBLISHED">Draft (Unpublished)</SelectItem>
                                        <SelectItem value="PUBLIC">Public</SelectItem>
                                        <SelectItem value="UNLISTED">Unlisted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </FieldGroup>

                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}