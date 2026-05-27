"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useGetDashboardStats, useListPublicForms } from "~/hooks/api/form"
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
    TrendingUpIcon,
    ActivityIcon,
    ClockIcon,
    BarChart2Icon,
    ShareIcon,
    CopyIcon,
    DownloadIcon,
    EyeIcon,
    LockIcon,
} from "lucide-react"

// ── Mock data for charts and activity ──
const WEEKLY_SUBMISSIONS = [14, 28, 22, 41, 36, 55, 48]
const WEEKLY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const FORM_VISIBILITY_DATA = [
    { label: "Public", value: 42, color: "#84cc16" },
    { label: "Unlisted", value: 31, color: "#a78bfa" },
    { label: "Draft", value: 27, color: "#475569" },
]
const ACTIVITY_FEED = [
    { type: "submission", form: "Game Server Registration", time: "2 min ago", icon: "Chest" },
    { type: "created", form: "Feedback Survey v2", time: "1 hr ago", icon: "Crafting_Table" },
    { type: "submission", form: "Bug Report Form", time: "3 hr ago", icon: "Chest" },
    { type: "shared", form: "Event RSVP", time: "5 hr ago", icon: "Compass" },
    { type: "submission", form: "Game Server Registration", time: "6 hr ago", icon: "Chest" },
    { type: "export", form: "Player Survey", time: "Yesterday", icon: "Barrel" },
    { type: "submission", form: "Feedback Survey v2", time: "Yesterday", icon: "Chest" },
]
const TOP_FORMS = [
    { title: "Game Server Registration", submissions: 214, trend: "+18%", visibility: "PUBLIC" },
    { title: "Feedback Survey v2", submissions: 186, trend: "+9%", visibility: "PUBLIC" },
    { title: "Bug Report Form", submissions: 97, trend: "+4%", visibility: "UNLISTED" },
    { title: "Event RSVP", submissions: 74, trend: "+22%", visibility: "PUBLIC" },
    { title: "Player Survey", submissions: 51, trend: "-3%", visibility: "UNLISTED" },
]
const FIELD_TYPE_BREAKDOWN = [
    { type: "Text", count: 48, color: "#84cc16" },
    { type: "Email", count: 31, color: "#22c55e" },
    { type: "Number", count: 19, color: "#a78bfa" },
    { type: "Toggle", count: 14, color: "#38bdf8" },
    { type: "Password", count: 8, color: "#fb923c" },
]

// ── Sparkline mini-chart ──
function Sparkline({ data, color = "#84cc16" }: { data: number[]; color?: string }) {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const w = 120
    const h = 36
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w
        const y = h - ((v - min) / range) * (h - 6) - 3
        return `${x},${y}`
    })
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
            <polyline
                points={pts.join(" ")}
                stroke={color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
            />
            <polyline
                points={`0,${h} ${pts.join(" ")} ${w},${h}`}
                fill={`${color}18`}
                stroke="none"
            />
        </svg>
    )
}

// ── Bar chart (submissions per day) ──
function WeeklyBarChart() {
    const max = Math.max(...WEEKLY_SUBMISSIONS)
    return (
        <div className="flex items-end gap-1.5 h-24 w-full">
            {WEEKLY_SUBMISSIONS.map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <div
                        className="w-full rounded-sm bg-[#84cc16]/80 hover:bg-[#84cc16] transition-colors cursor-default"
                        style={{ height: `${(val / max) * 80}px` }}
                        title={`${WEEKLY_LABELS[i]}: ${val} submissions`}
                    />
                    <span className="text-[9px] font-mono text-slate-500 uppercase">{WEEKLY_LABELS[i]}</span>
                </div>
            ))}
        </div>
    )
}

// ── Donut chart (visibility breakdown) ──
function DonutChart({ data }: { data: typeof FORM_VISIBILITY_DATA }) {
    const total = data.reduce((s, d) => s + d.value, 0)
    let cumulative = 0
    const r = 40
    const cx = 56
    const cy = 56
    const circumference = 2 * Math.PI * r
    const segments = data.map((d) => {
        const pct = d.value / total
        const dash = pct * circumference
        const gap = circumference - dash
        const offset = -cumulative * circumference
        cumulative += pct
        return { ...d, dash, gap, offset }
    })
    return (
        <div className="flex items-center gap-6">
            <svg width={112} height={112} viewBox="0 0 112 112">
                {segments.map((seg, i) => (
                    <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="14"
                        strokeDasharray={`${seg.dash} ${seg.gap}`}
                        strokeDashoffset={seg.offset}
                        style={{ transition: "stroke-dasharray 0.5s ease" }}
                        transform={`rotate(-90 ${cx} ${cy})`}
                    />
                ))}
                <circle cx={cx} cy={cy} r="26" fill="#18181b" />
                <text x={cx} y={cy - 4} textAnchor="middle" fill="#f4f4f5" fontSize="13" fontWeight="600">{total}</text>
                <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" fontSize="8">FORMS</text>
            </svg>
            <div className="flex flex-col gap-2">
                {data.map((d) => (
                    <div key={d.label} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                        <span className="text-xs text-slate-400 font-mono">{d.label}</span>
                        <span className="text-xs text-white font-semibold ml-auto pl-4">{d.value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ── Activity icon map ──
const ACTIVITY_LABELS: Record<string, { label: string; color: string }> = {
    submission: { label: "New submission", color: "text-[#84cc16]" },
    created: { label: "Form created", color: "text-cyan-400" },
    shared: { label: "Link shared", color: "text-purple-400" },
    export: { label: "CSV exported", color: "text-amber-400" },
}

export default function DashboardPage() {
    const router = useRouter()
    const { stats, isLoading } = useGetDashboardStats()
    const { publicForms, isLoading: isFormsLoading } = useListPublicForms()
    const [greeting, setGreeting] = useState("Good morning")

    useEffect(() => {
        const h = new Date().getHours()
        if (h >= 12 && h < 17) setGreeting("Good afternoon")
        else if (h >= 17) setGreeting("Good evening")
    }, [])

    const totalWeekly = WEEKLY_SUBMISSIONS.reduce((a, b) => a + b, 0)
    const prevWeekAvg = 28
    const weeklyGrowth = Math.round(((totalWeekly / 7 - prevWeekAvg) / prevWeekAvg) * 100)

    return (
        <div className="flex flex-1 flex-col min-h-screen bg-[#0f172a]">

            {/* ── Header ── */}
            <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#365314]/40 px-4 lg:px-6 bg-[#111827]/80 backdrop-blur-sm sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <LayoutDashboardIcon className="size-4 text-[#84cc16]" />
                    <h1 className="text-base font-semibold text-white font-pixel tracking-wide">Command Center</h1>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <Button asChild variant="outline" size="sm" className="rounded-sm border-[#365314] text-slate-300 hover:border-[#84cc16]/50 hover:text-white hidden md:flex">
                        <Link href="/dashboard/forms">
                            <PlusIcon className="size-3 mr-1.5" />
                            New Form
                        </Link>
                    </Button>
                </div>
            </header>

            <div className="flex flex-col gap-6 p-4 lg:p-6">

                {/* ── Greeting Banner ── */}
                <div className="relative rounded-sm border-2 border-[#365314] bg-[#18181b] overflow-hidden p-6">
                    <div
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: "url('/assets/minecraft/blocks/Blackstone.png')", backgroundRepeat: "repeat", backgroundSize: "128px", imageRendering: "pixelated" }}
                    />
                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                                <Image src="/assets/minecraft/blocks/Beacon.png" width={28} height={28} alt="" style={{ imageRendering: "pixelated" }} />
                                <h2 className="text-xl font-pixel text-white tracking-wide">{greeting}, Builder</h2>
                            </div>
                            <p className="text-sm text-slate-400 font-sans pl-9">
                                You have <span className="text-[#84cc16] font-semibold">{totalWeekly} submissions</span> this week — {weeklyGrowth > 0 ? `${weeklyGrowth}% above` : `${Math.abs(weeklyGrowth)}% below`} your weekly average.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Button asChild size="sm" className="rounded-sm bg-[#84cc16] text-white border-b-2 border-r-2 border-[#365314] hover:bg-[#22c55e]">
                                <Link href="/dashboard/forms">
                                    <PlusIcon className="size-3.5 mr-1.5" />
                                    Create Form
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="rounded-sm border-[#365314] text-slate-300 hover:border-[#84cc16]/50">
                                <Link href="/explore">Browse Templates</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ── Hero Stats Row ── */}
                <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                    {/* Total Forms */}
                    <Card className="group relative overflow-hidden bg-[#18181b] border-2 border-[#365314] hover:border-[#84cc16]/40 transition-all rounded-sm shadow-hud-outset">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-xs font-mono uppercase tracking-widest text-slate-500">Total Forms</CardDescription>
                                <div className="rounded-sm bg-[#84cc16]/10 p-1.5">
                                    <FileTextIcon className="size-3.5 text-[#84cc16]" />
                                </div>
                            </div>
                            {isLoading ? (
                                <Skeleton className="h-9 w-16 bg-[#1e293b]" />
                            ) : (
                                <div className="flex items-end gap-3 mt-1">
                                    <CardTitle className="text-3xl font-bold tabular-nums text-white font-pixel">
                                        {stats?.totalForms ?? 0}
                                    </CardTitle>
                                    <Sparkline data={[3, 5, 4, 7, 6, 9, stats?.totalForms ?? 8]} color="#84cc16" />
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="pt-0 pb-4">
                            <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">All time</p>
                        </CardContent>
                    </Card>

                    {/* Total Submissions */}
                    <Card className="group relative overflow-hidden bg-[#18181b] border-2 border-[#365314] hover:border-emerald-500/40 transition-all rounded-sm shadow-hud-outset">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-xs font-mono uppercase tracking-widest text-slate-500">Submissions</CardDescription>
                                <div className="rounded-sm bg-emerald-500/10 p-1.5">
                                    <InboxIcon className="size-3.5 text-emerald-400" />
                                </div>
                            </div>
                            {isLoading ? (
                                <Skeleton className="h-9 w-16 bg-[#1e293b]" />
                            ) : (
                                <div className="flex items-end gap-3 mt-1">
                                    <CardTitle className="text-3xl font-bold tabular-nums text-white font-pixel">
                                        {stats?.totalSubmissions ?? 0}
                                    </CardTitle>
                                    <Sparkline data={[12, 18, 14, 22, 19, 28, stats?.totalSubmissions ?? 25]} color="#22c55e" />
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="pt-0 pb-4">
                            <div className="flex items-center gap-1.5">
                                <TrendingUpIcon className="size-3 text-emerald-400" />
                                <p className="text-[11px] text-emerald-400 font-mono">+{weeklyGrowth}% this week</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Public Forms */}
                    <Card className="group relative overflow-hidden bg-[#18181b] border-2 border-[#365314] hover:border-cyan-500/40 transition-all rounded-sm shadow-hud-outset">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-xs font-mono uppercase tracking-widest text-slate-500">Public Live</CardDescription>
                                <div className="rounded-sm bg-cyan-500/10 p-1.5">
                                    <GlobeIcon className="size-3.5 text-cyan-400" />
                                </div>
                            </div>
                            {isLoading ? (
                                <Skeleton className="h-9 w-16 bg-[#1e293b]" />
                            ) : (
                                <div className="flex items-end gap-3 mt-1">
                                    <CardTitle className="text-3xl font-bold tabular-nums text-white font-pixel">
                                        {stats?.activePublicForms ?? 0}
                                    </CardTitle>
                                    <Sparkline data={[1, 2, 2, 3, 4, 4, stats?.activePublicForms ?? 5]} color="#38bdf8" />
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="pt-0 pb-4">
                            <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Accepting responses</p>
                        </CardContent>
                    </Card>

                    {/* Response Rate */}
                    <Card className="group relative overflow-hidden bg-[#18181b] border-2 border-[#365314] hover:border-amber-500/40 transition-all rounded-sm shadow-hud-outset">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardDescription className="text-xs font-mono uppercase tracking-widest text-slate-500">Avg / Form</CardDescription>
                                <div className="rounded-sm bg-amber-500/10 p-1.5">
                                    <BarChart2Icon className="size-3.5 text-amber-400" />
                                </div>
                            </div>
                            <div className="flex items-end gap-3 mt-1">
                                <CardTitle className="text-3xl font-bold tabular-nums text-white font-pixel">
                                    {stats?.totalForms ? Math.round((stats?.totalSubmissions ?? 0) / stats.totalForms) : 0}
                                </CardTitle>
                                <Sparkline data={[4, 6, 5, 8, 7, 9, 11]} color="#f59e0b" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 pb-4">
                            <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Responses per form</p>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Row 2: Weekly Chart + Visibility Donut ── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    {/* Weekly Submissions Bar Chart */}
                    <Card className="lg:col-span-3 bg-[#18181b] border-2 border-[#365314] rounded-sm shadow-hud-outset">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-pixel text-white uppercase tracking-wide">Weekly Submissions</CardTitle>
                                    <CardDescription className="text-[11px] text-slate-500 font-mono mt-0.5">Last 7 days · {totalWeekly} total</CardDescription>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-sm px-2 py-1">
                                    <TrendingUpIcon className="size-3" />
                                    +{weeklyGrowth}%
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pb-5">
                            <WeeklyBarChart />
                        </CardContent>
                    </Card>

                    {/* Visibility Breakdown Donut */}
                    <Card className="lg:col-span-2 bg-[#18181b] border-2 border-[#365314] rounded-sm shadow-hud-outset">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-pixel text-white uppercase tracking-wide">Form Visibility</CardTitle>
                            <CardDescription className="text-[11px] text-slate-500 font-mono mt-0.5">Distribution by type</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DonutChart data={FORM_VISIBILITY_DATA} />
                        </CardContent>
                    </Card>
                </div>

                {/* ── Row 3: Top Forms + Activity Feed ── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* Top Performing Forms */}
                    <Card className="lg:col-span-2 bg-[#18181b] border-2 border-[#365314] rounded-sm shadow-hud-outset">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Image src="/assets/minecraft/blocks/Anvil.png" width={18} height={18} alt="" style={{ imageRendering: "pixelated" }} />
                                    <CardTitle className="text-sm font-pixel text-white uppercase tracking-wide">Top Forms</CardTitle>
                                </div>
                                <Button asChild variant="outline" size="sm" className="rounded-sm border-[#365314] text-slate-400 hover:border-[#84cc16]/50 text-xs h-7">
                                    <Link href="/dashboard/forms">View All</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-1.5">
                            {TOP_FORMS.map((form, i) => {
                                const barWidth = (form.submissions / (TOP_FORMS[0]?.submissions || 1)) * 100
                                const isPositive = form.trend.startsWith("+")
                                return (
                                    <div key={i} className="group flex items-center gap-3 rounded-sm p-2.5 hover:bg-[#1e293b]/50 transition-colors cursor-pointer">
                                        <span className="text-xs font-mono text-slate-600 w-4 shrink-0 text-right">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-semibold text-white truncate group-hover:text-[#84cc16] transition-colors">{form.title}</span>
                                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[9px] h-4 px-1.5 font-mono ${
                                                            form.visibility === "PUBLIC"
                                                                ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                                                                : "text-purple-400 border-purple-500/30 bg-purple-500/10"
                                                        }`}
                                                    >
                                                        {form.visibility === "PUBLIC" ? <GlobeIcon className="size-2 mr-0.5" /> : <LockIcon className="size-2 mr-0.5" />}
                                                        {form.visibility === "PUBLIC" ? "Public" : "Unlisted"}
                                                    </Badge>
                                                    <span className={`text-[10px] font-mono font-semibold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                                                        {form.trend}
                                                    </span>
                                                    <span className="text-[11px] font-semibold text-white w-8 text-right">{form.submissions}</span>
                                                </div>
                                            </div>
                                            <div className="w-full h-1 bg-[#0f172a] rounded-sm overflow-hidden">
                                                <div
                                                    className="h-full rounded-sm bg-[#84cc16]/60 group-hover:bg-[#84cc16] transition-colors"
                                                    style={{ width: `${barWidth}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>

                    {/* Activity Feed */}
                    <Card className="bg-[#18181b] border-2 border-[#365314] rounded-sm shadow-hud-outset">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <ActivityIcon className="size-4 text-[#84cc16]" />
                                <CardTitle className="text-sm font-pixel text-white uppercase tracking-wide">Live Activity</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-0 divide-y divide-[#365314]/30">
                            {ACTIVITY_FEED.map((item, i) => {
                                const meta = ACTIVITY_LABELS[item.type]
                                return (
                                    <div key={i} className="flex items-start gap-2.5 py-2.5 first:pt-0">
                                        <div className="shrink-0 mt-0.5">
                                            <Image
                                                src={`/assets/minecraft/blocks/${item.icon}.png`}
                                                width={16}
                                                height={16}
                                                alt=""
                                                style={{ imageRendering: "pixelated" }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[11px] font-mono font-semibold ${meta?.color} uppercase tracking-wider`}>{meta?.label}</p>
                                            <p className="text-xs text-slate-300 truncate mt-0.5">{item.form}</p>
                                        </div>
                                        <span className="text-[10px] text-slate-600 font-mono shrink-0 mt-0.5">{item.time}</span>
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Row 4: Recent Forms + Quick Actions ── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Recent Forms */}
                    <Card className="lg:col-span-2 bg-[#18181b] border-2 border-[#365314] rounded-sm shadow-hud-outset">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-pixel text-white uppercase tracking-wide">Recent Forms</CardTitle>
                                    <CardDescription className="text-slate-400 mt-1 text-xs font-sans">Your latest creations</CardDescription>
                                </div>
                                <Button asChild variant="outline" size="sm" className="rounded-sm border-[#365314] text-slate-400 hover:border-[#84cc16]/50 text-xs h-7">
                                    <Link href="/dashboard/forms">View All</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-2">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex items-center justify-between rounded-sm border border-[#365314]/30 p-3 bg-[#0f172a]/50">
                                            <div className="space-y-1.5">
                                                <Skeleton className="h-4 w-32 bg-[#1e293b]" />
                                                <Skeleton className="h-3 w-20 bg-[#1e293b]" />
                                            </div>
                                            <Skeleton className="h-6 w-16 bg-[#1e293b]" />
                                        </div>
                                    ))}
                                </div>
                            ) : stats?.recentForms && stats.recentForms.length > 0 ? (
                                <div className="space-y-2">
                                    {stats.recentForms.map((form) => (
                                        <Link
                                            key={form.id}
                                            href={`/dashboard/forms/${form.id}`}
                                            className="flex items-center justify-between rounded-sm border border-[#365314]/30 p-3 bg-[#0f172a]/50 hover:bg-[#1e293b]/60 hover:border-[#365314] transition-all group"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-[#84cc16] transition-colors">
                                                    {form.title}
                                                </p>
                                                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                                                    {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : "—"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 ml-3 shrink-0">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[9px] font-mono ${
                                                        form.visibility === "PUBLIC"
                                                            ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                                                            : form.visibility === "UNLISTED"
                                                            ? "text-purple-400 border-purple-500/30 bg-purple-500/10"
                                                            : "text-slate-500 border-slate-700/50 bg-slate-800/50"
                                                    }`}
                                                >
                                                    {form.visibility === "PUBLIC" ? "Public" : form.visibility === "UNLISTED" ? "Unlisted" : "Draft"}
                                                </Badge>
                                                <ArrowRightIcon className="size-3 text-slate-600 group-hover:text-[#84cc16] group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-sm border border-dashed border-[#365314]/50 p-8 text-center bg-[#0f172a]/30">
                                    <SparklesIcon className="size-8 text-[#84cc16]/40 mx-auto mb-3" />
                                    <p className="text-sm font-semibold text-slate-200 mb-1">No forms yet</p>
                                    <p className="text-xs text-slate-500 mb-4 font-sans">Create your first form to get started</p>
                                    <Button asChild size="sm" className="rounded-sm bg-[#84cc16] text-white border-b-2 border-r-2 border-[#365314] hover:bg-[#22c55e]">
                                        <Link href="/dashboard/forms">
                                            <PlusIcon className="size-4 mr-1" />
                                            Create Form
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions + Field Type Breakdown */}
                    <div className="flex flex-col gap-4">
                        {/* Quick Actions */}
                        <Card className="bg-[#18181b] border-2 border-[#365314] rounded-sm shadow-hud-outset">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <ZapIcon className="size-4 text-[#84cc16]" />
                                    <CardTitle className="text-sm font-pixel text-white uppercase tracking-wide">Quick Actions</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {[
                                    { icon: <PlusIcon className="size-3.5" />, label: "Create New Form", href: "/dashboard/forms", accent: "text-[#84cc16]", bg: "bg-[#84cc16]/10" },
                                    { icon: <FileTextIcon className="size-3.5" />, label: "View All Forms", href: "/dashboard/forms", accent: "text-emerald-400", bg: "bg-emerald-500/10" },
                                    { icon: <EyeIcon className="size-3.5" />, label: "Browse Templates", href: "/explore", accent: "text-cyan-400", bg: "bg-cyan-500/10" },
                                    { icon: <DownloadIcon className="size-3.5" />, label: "Export Responses", href: "/dashboard/forms", accent: "text-amber-400", bg: "bg-amber-500/10" },
                                    { icon: <ShareIcon className="size-3.5" />, label: "Share a Form", href: "/dashboard/forms", accent: "text-purple-400", bg: "bg-purple-500/10" },
                                ].map((action, i) => (
                                    <Button
                                        key={i}
                                        asChild
                                        variant="outline"
                                        className="w-full justify-start gap-2.5 h-9 border-[#365314]/50 hover:border-[#365314] hover:bg-[#0f172a]/60 rounded-sm text-xs"
                                    >
                                        <Link href={action.href}>
                                            <div className={`rounded-sm ${action.bg} p-1 ${action.accent}`}>
                                                {action.icon}
                                            </div>
                                            <span className="text-slate-300">{action.label}</span>
                                        </Link>
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Field Type Breakdown */}
                        <Card className="bg-[#18181b] border-2 border-[#365314] rounded-sm shadow-hud-outset">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Image src="/assets/minecraft/blocks/Crafter.png" width={16} height={16} alt="" style={{ imageRendering: "pixelated" }} />
                                    <CardTitle className="text-sm font-pixel text-white uppercase tracking-wide">Field Types</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {FIELD_TYPE_BREAKDOWN.map((f) => {
                                    const maxCount = FIELD_TYPE_BREAKDOWN[0]?.count
                                    return (
                                        <div key={f.type} className="flex items-center gap-2">
                                            <span className="text-[11px] font-mono text-slate-400 w-14 shrink-0">{f.type}</span>
                                            <div className="flex-1 h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{ width: `${(f.count / (maxCount || 1)) * 100}%`, background: f.color }}
                                                />
                                            </div>
                                            <span className="text-[11px] font-mono text-slate-500 w-6 text-right">{f.count}</span>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* ── Row 5: Public Templates ── */}
                <Card className="bg-[#18181b] border-2 border-[#365314] rounded-sm shadow-hud-outset">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Image
                                    src="/assets/minecraft/blocks/Bookshelf.png"
                                    width={18}
                                    height={18}
                                    alt=""
                                    style={{ imageRendering: "pixelated" }}
                                />
                                <div>
                                    <CardTitle className="text-sm font-pixel text-white uppercase tracking-wide">Public Templates</CardTitle>
                                    <CardDescription className="text-slate-400 mt-0.5 text-xs font-sans">
                                        Explore forms created by the community
                                    </CardDescription>
                                </div>
                            </div>
                            <Button asChild variant="outline" size="sm" className="rounded-sm border-[#365314] text-slate-400 hover:border-[#84cc16]/50 text-xs h-7">
                                <Link href="/explore">Browse All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isFormsLoading ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-28 rounded-sm border border-[#365314]/30 p-4 bg-[#0f172a]/50 animate-pulse" />
                                ))}
                            </div>
                        ) : publicForms && publicForms.length > 0 ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {publicForms.map((form) => (
                                    <Link
                                        key={form.id}
                                        href={`/form/${form.id}`}
                                        className="group relative rounded-sm border-2 border-[#365314]/60 bg-[#0f172a]/50 p-4 hover:border-[#84cc16]/65 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                                    >
                                        <div
                                            className="absolute inset-0 pointer-events-none opacity-[0.025] rounded-sm"
                                            style={{
                                                backgroundImage: "url('/assets/minecraft/blocks/Blackstone.png')",
                                                backgroundRepeat: "repeat",
                                                backgroundSize: "96px",
                                                imageRendering: "pixelated",
                                            }}
                                        />
                                        <div className="relative z-10 space-y-2">
                                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                                                {form.fieldCount} fields
                                            </span>
                                            <h3 className="font-semibold text-sm text-white group-hover:text-[#84cc16] transition-colors line-clamp-1 flex items-center">
                                                {form.title}
                                                <Image
                                                    src="/assets/minecraft/items/Arrow.png"
                                                    width={10}
                                                    height={10}
                                                    alt=""
                                                    style={{ imageRendering: "pixelated" }}
                                                    className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ml-1.5"
                                                />
                                            </h3>
                                            <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-2">
                                                {form.description || "Interactive template ready to capture responses."}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-sm border border-dashed border-[#365314]/50 p-8 text-center bg-[#0f172a]/30">
                                <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">No public templates available.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Row 6: Tip of the Day + API Banner ── */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Tip of the day */}
                    <div className="relative rounded-sm border-2 border-[#365314]/60 bg-[#18181b] p-5 flex items-start gap-4">
                        <Image src="/assets/minecraft/blocks/Bookshelf.png" width={32} height={32} alt="" style={{ imageRendering: "pixelated" }} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-[#84cc16] mb-1">Tip of the Day</p>
                            <p className="text-sm font-semibold text-white mb-1">Use Unlisted forms for exclusive access</p>
                            <p className="text-xs text-slate-400 font-sans leading-relaxed">
                                Unlisted forms are published but hidden from the explore gallery. Only people with your direct link can access them — perfect for internal surveys or invite-only events.
                            </p>
                        </div>
                    </div>

                    {/* API Banner */}
                    <div className="relative rounded-sm border-2 border-[#365314]/60 bg-[#18181b] p-5 flex items-start gap-4 group overflow-hidden hover:border-[#84cc16]/30 transition-colors">
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "url('/assets/minecraft/blocks/Command_Block.png')", backgroundRepeat: "repeat", backgroundSize: "64px", imageRendering: "pixelated" }} />
                        <Image src="/assets/minecraft/blocks/Command_Block.png" width={32} height={32} alt="" style={{ imageRendering: "pixelated" }} className="shrink-0 mt-0.5 relative z-10" />
                        <div className="relative z-10 flex-1">
                            <p className="text-[10px] font-mono uppercase tracking-widest text-purple-400 mb-1">Developer API</p>
                            <p className="text-sm font-semibold text-white mb-1">Integrate with your stack</p>
                            <p className="text-xs text-slate-400 font-sans leading-relaxed mb-3">
                                Full tRPC-backed REST API with Scalar docs. Interact with forms and submissions programmatically.
                            </p>
                            <Button asChild variant="outline" size="sm" className="rounded-sm border-[#365314] text-slate-300 hover:border-purple-500/50 hover:text-purple-300 text-xs h-7">
                                <Link href="/docs">View API Docs →</Link>
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}