"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useGetDashboardStats } from "~/hooks/api/form"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import {
    LayoutDashboardIcon,
    FileTextIcon,
    InboxIcon,
    GlobeIcon,
    PlusIcon,
    ArrowRightIcon,
    SparklesIcon,
    ZapIcon,
} from "lucide-react"

export default function DashboardPage() {
    const router = useRouter()
    const { stats, isLoading } = useGetDashboardStats()

    return (
        <div className="flex flex-1 flex-col">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#365314]/40 px-4 lg:px-6">
                <div className="flex items-center gap-2">
                    <LayoutDashboardIcon className="size-4 text-[#84cc16]" />
                    <h1 className="text-base font-semibold text-white">Command Center</h1>
                </div>
            </header>

            <div className="flex flex-col gap-6 p-4 lg:p-6">
                {/* Hero Stats Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {/* Total Forms */}
                    <Card className="@container/card group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#84cc16]/5 to-transparent pointer-events-none" />
                        <CardHeader className="relative">
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-sm font-medium text-slate-400">Total Forms</CardDescription>
                                <div className="rounded-sm bg-[#84cc16]/10 p-2">
                                    <FileTextIcon className="size-4 text-[#84cc16]" />
                                </div>
                            </div>
                            {isLoading ? (
                                <Skeleton className="h-9 w-16" />
                            ) : (
                                <CardTitle className="text-3xl font-bold tabular-nums text-white">
                                    {stats?.totalForms ?? 0}
                                </CardTitle>
                            )}
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-xs text-slate-500">All forms in your world</p>
                        </CardContent>
                    </Card>

                    {/* Total Submissions */}
                    <Card className="@container/card group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                        <CardHeader className="relative">
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-sm font-medium text-slate-400">Total Submissions</CardDescription>
                                <div className="rounded-sm bg-emerald-500/10 p-2">
                                    <InboxIcon className="size-4 text-emerald-400" />
                                </div>
                            </div>
                            {isLoading ? (
                                <Skeleton className="h-9 w-16" />
                            ) : (
                                <CardTitle className="text-3xl font-bold tabular-nums text-white">
                                    {stats?.totalSubmissions ?? 0}
                                </CardTitle>
                            )}
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-xs text-slate-500">Responses collected</p>
                        </CardContent>
                    </Card>

                    {/* Active Public Forms */}
                    <Card className="@container/card group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
                        <CardHeader className="relative">
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-sm font-medium text-slate-400">Public Forms</CardDescription>
                                <div className="rounded-sm bg-cyan-500/10 p-2">
                                    <GlobeIcon className="size-4 text-cyan-400" />
                                </div>
                            </div>
                            {isLoading ? (
                                <Skeleton className="h-9 w-16" />
                            ) : (
                                <CardTitle className="text-3xl font-bold tabular-nums text-white">
                                    {stats?.activePublicForms ?? 0}
                                </CardTitle>
                            )}
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-xs text-slate-500">Live & accepting responses</p>
                        </CardContent>
                    </Card>

                    {/* Quick Create */}
                    <Card
                        className="@container/card group relative overflow-hidden cursor-pointer transition-all hover:border-[#84cc16]/60 hover:shadow-[0_0_20px_rgba(132,204,22,0.1)]"
                        onClick={() => router.push("/dashboard/forms")}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#84cc16]/5 to-emerald-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="relative">
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-sm font-medium text-slate-400">Quick Actions</CardDescription>
                                <div className="rounded-sm bg-[#84cc16]/10 p-2">
                                    <ZapIcon className="size-4 text-[#84cc16]" />
                                </div>
                            </div>
                            <CardTitle className="text-lg font-bold text-white">
                                Manage Forms
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                Create, edit & share <ArrowRightIcon className="size-3" />
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Forms + Quick Actions */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Recent Forms */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg text-white">Recent Forms</CardTitle>
                                    <CardDescription className="text-slate-400 mt-1">Your latest creations</CardDescription>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/dashboard/forms">View All</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex items-center justify-between rounded-sm border border-slate-800 p-3 bg-slate-900/50">
                                            <div className="space-y-1.5">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                            <Skeleton className="h-6 w-16" />
                                        </div>
                                    ))}
                                </div>
                            ) : stats?.recentForms && stats.recentForms.length > 0 ? (
                                <div className="space-y-2">
                                    {stats.recentForms.map((form) => (
                                        <Link
                                            key={form.id}
                                            href={`/dashboard/forms/${form.id}`}
                                            className="flex items-center justify-between rounded-sm border border-slate-800 p-3 bg-slate-900/50 hover:bg-slate-800/50 hover:border-[#365314] transition-all group"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-[#84cc16] transition-colors">
                                                    {form.title}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {form.createdAt
                                                        ? new Date(form.createdAt).toLocaleDateString()
                                                        : "—"}
                                                </p>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] shrink-0 ml-3 ${
                                                    form.visibility === "PUBLIC"
                                                        ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                                                        : form.visibility === "UNLISTED"
                                                        ? "text-purple-400 border-purple-500/30 bg-purple-500/10"
                                                        : "text-red-400 border-red-500/30 bg-red-500/10"
                                                }`}
                                            >
                                                {form.visibility === "PUBLIC"
                                                    ? "Public"
                                                    : form.visibility === "UNLISTED"
                                                    ? "Unlisted"
                                                    : "Draft"}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-sm border border-dashed border-[#365314]/50 p-8 text-center bg-[#18181b]/50">
                                    <SparklesIcon className="size-8 text-[#84cc16]/40 mx-auto mb-3" />
                                    <p className="text-sm font-semibold text-slate-200 mb-1">No forms yet</p>
                                    <p className="text-xs text-slate-500 mb-4">Create your first form to get started</p>
                                    <Button asChild size="sm">
                                        <Link href="/dashboard/forms">
                                            <PlusIcon className="size-4 mr-1" />
                                            Create Form
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions Panel */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
                            <CardDescription className="text-slate-400 mt-1">Jump to common tasks</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                asChild
                                variant="outline"
                                className="w-full justify-start gap-3 h-12 border-slate-800 hover:border-[#365314] hover:bg-slate-800/50"
                            >
                                <Link href="/dashboard/forms">
                                    <div className="rounded-sm bg-[#84cc16]/10 p-1.5">
                                        <PlusIcon className="size-4 text-[#84cc16]" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-200">Create New Form</span>
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full justify-start gap-3 h-12 border-slate-800 hover:border-[#365314] hover:bg-slate-800/50"
                            >
                                <Link href="/dashboard/forms">
                                    <div className="rounded-sm bg-emerald-500/10 p-1.5">
                                        <FileTextIcon className="size-4 text-emerald-400" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-200">View All Forms</span>
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
