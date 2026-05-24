"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "~/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"

export default function FormBuilderPage() {
    const params = useParams<{ id: string }>()

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <Button asChild size="sm" variant="ghost">
                    <Link href="/dashboard/forms">
                        <ArrowLeftIcon className="size-4 mr-1" />
                        Back
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Form Builder</h1>
            </div>

            <div className="rounded-lg border p-8 text-center text-muted-foreground">
                <p className="text-lg font-medium mb-2">Builder coming soon</p>
                <p className="text-sm">
                    Form ID: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{params.id}</code>
                </p>
            </div>
        </div>
    )
}
