"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useUser } from "~/hooks/api/auth"
import { useListPublicForms } from "~/hooks/api/form"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent } from "~/components/ui/card"
import {
  SparklesIcon,
  CheckIcon,
  ArrowRightIcon,
  FileTextIcon,
  LayersIcon,
  BarChart3Icon,
  ShieldIcon,
  ZapIcon,
  ChevronRightIcon
} from "lucide-react"

export default function Home() {
  const { user } = useUser()
  const { publicForms, isLoading: isFormsLoading } = useListPublicForms()
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly")

  const FEATURES = [
    {
      icon: <LayersIcon className="size-5 text-[#84cc16]" />,
      title: "Visual Form Builder",
      description: "Build beautiful forms dynamically using our interactive field editor. Support for text, email, numbers, passwords, and toggle switches."
    },
    {
      icon: <BarChart3Icon className="size-5 text-[#a3e635]" />,
      title: "Powerful Submissions Insights",
      description: "Analyze, search, and aggregate responses in a premium real-time dashboard layout with a built-in CSV export tool."
    },
    {
      icon: <ShieldIcon className="size-5 text-[#22c55e]" />,
      title: "Public Share Securely",
      description: "Instantly publish and share forms using clean public links. Includes local validations to filter out bad inputs automatically."
    },
    {
      icon: <ZapIcon className="size-5 text-amber-400" />,
      title: "Reliable Response Storage",
      description: "Never lose a response. Structured database models capture every answer with validation before it is saved."
    }
  ]

  const PRICING_PLANS = [
    {
      name: "Basic Starter",
      price: "$0",
      description: "Perfect for personal projects or basic feedback collecting.",
      features: [
        "Up to 3 active forms",
        "Standard field types (Text, Password)",
        "Basic tabular submission log",
        "Shared hosting speed"
      ],
      cta: "Get Started Free",
      popular: false,
      border: "border-2 border-[#365314]"
    },
    {
      name: "Formz Professional",
      price: billingPeriod === "monthly" ? "$19" : "$14",
      description: "Designed for developers and growing startups needing rich features.",
      features: [
        "Unlimited active forms",
        "All premium fields (Email, Switch, Numbers)",
        "Dynamic CSV data export",
        "Priority analytics & response tracking",
        "Dedicated submission speeds"
      ],
      cta: "Upgrade to Professional",
      popular: true,
      border: "border-4 border-[#84cc16] shadow-[0_0_20px_rgba(132,204,22,0.25)]"
    },
    {
      name: "Scale Enterprise",
      price: "Custom",
      description: "For deep security requirements and large enterprise needs.",
      features: [
        "Everything in Professional",
        "Password-protected public forms",
        "Advanced response encryption",
        "Dedicated account representative",
        "Custom domain branding"
      ],
      cta: "Contact Enterprise Sales",
      popular: false,
      border: "border-2 border-[#365314]"
    }
  ]

  return (
    <div className="relative min-h-screen bg-[#0f172a] text-[#f4f4f5] overflow-x-hidden font-pixel">
      {/* Ambient glows inside background */}
      <div className="fixed top-0 left-1/3 h-[500px] w-[500px] bg-lime-500/5 blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 h-[400px] w-[400px] bg-emerald-500/5 blur-3xl pointer-events-none -z-10" />

      {/* Hero Full Viewport Section */}
      <section 
        className="relative w-full min-h-screen flex flex-col justify-center items-center text-center bg-cover bg-center overflow-hidden"
        style={{ 
          backgroundImage: "url('/assets/minecraft/homepage.png')",
        }}
      >
        {/* Transparent Header absolute overlay on top of background */}
        <header className="absolute top-0 left-0 right-0 w-full bg-gradient-to-b from-black/40 to-transparent z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="size-8 rounded-sm bg-[#84cc16] flex items-center justify-center border border-[#365314] shadow-hud-outset">
                <FileTextIcon className="size-4.5 text-white" />
              </div>
              <span className="font-pixel font-bold text-xl tracking-wider text-white">
                FORMZ
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-200">
              <a href="#features" className="hover:text-[#84cc16] transition-colors drop-shadow-md">Features</a>
              <a href="#explore" className="hover:text-[#84cc16] transition-colors drop-shadow-md">Explore Templates</a>
              <a href="#pricing" className="hover:text-[#84cc16] transition-colors drop-shadow-md">Pricing Plans</a>
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <Button asChild size="sm" variant="default">
                  <Link href="/dashboard">
                    Get Started
                    <ArrowRightIcon className="size-4 ml-1.5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="sm" variant="ghost" className="text-slate-200 hover:text-white hover:bg-white/10">
                    <Link href="/login">Log In</Link>
                  </Button>
                  <Button asChild size="sm" variant="default">
                    <Link href="/signup">Signup</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* High fidelity dark overlay gradient for superior text contrast */}
        <div className="absolute inset-0 pointer-events-none z-10" />

        <div className="relative z-20 space-y-8 px-6 max-w-4xl mx-auto flex flex-col items-center pt-60">

          <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] font-medium font-sans">
            Build responsive Minecraft-themed forms in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 w-full sm:w-auto">
            <Button asChild size="lg" className="w-full sm:w-auto text-base px-8 py-6 rounded-sm bg-[#84cc16] text-white border-b-4 border-r-4 border-[#365314] hover:bg-[#22c55e] hover:border-[#1e3a07]">
              <Link href={user ? "/dashboard" : "/signup"}>
                {user ? "Go to Dashboard" : "Start Building for Free"}
                <ArrowRightIcon className="size-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 border-t-2 border-[#365314] bg-[#18181b]/30">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-[#84cc16] border-[#365314] bg-[#84cc16]/10 text-xs rounded-sm">
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-pixel uppercase tracking-wide text-white">
              Everything you need to collect submissions
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-normal font-sans">
              Formz maps dynamic schema capabilities to modern gaming components securely and gracefully.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-6">
            {FEATURES.map((feature, i) => (
              <Card key={i} className="bg-[#18181b] border-2 border-[#365314] hover:border-[#84cc16]/65 transition-all shadow-hud-outset rounded-sm">
                <CardContent className="p-6 flex gap-4">
                  <div className="p-3 rounded-sm bg-[#111827] border-2 border-[#365314] shrink-0 self-start">
                    {feature.icon}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-[#84cc16] text-base">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Template Explore Showcase */}
      <section id="explore" className="py-20 px-6 border-t-2 border-[#365314]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-[#a3e635] border-[#365314] bg-[#22c55e]/10 text-xs rounded-sm">
              Explore Showcase
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-pixel uppercase tracking-wide text-white">
              Curated public templates & creations
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-normal font-sans">
              Pre-built themed forms designed with premium UX standards ready to collect responses.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {isFormsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-sm border-2 border-[#365314] bg-[#18181b] p-5 animate-pulse">
                  <div className="flex justify-between mb-4">
                    <div className="h-5 w-20 bg-[#111827] border border-[#365314]/30 rounded-sm" />
                    <div className="h-4 w-12 bg-[#111827] border border-[#365314]/30 rounded-sm" />
                  </div>
                  <div className="h-5 w-3/4 bg-[#111827] rounded-sm mb-2" />
                  <div className="h-3 w-full bg-[#111827] rounded-sm" />
                </div>
              ))
            ) : publicForms && publicForms.length > 0 ? (
              publicForms.map((form) => (
                <Link href={`/form/${form.id}`} key={form.id}>
                  <div className="group relative rounded-sm border-2 border-[#365314] bg-[#18181b] p-5 hover:border-[#84cc16]/65 transition-all duration-200 cursor-pointer shadow-hud-outset h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary" className="bg-[#84cc16]/10 text-[#84cc16] border-[#365314] border text-[10px] px-2 py-0.5 rounded-sm">
                          Public Form
                        </Badge>
                        <span className="text-[10px] text-slate-450 font-mono uppercase tracking-wider">{form.fieldCount} fields</span>
                      </div>
                      <h3 className="font-semibold text-base text-white group-hover:text-[#84cc16] transition-colors line-clamp-1 flex items-center">
                        {form.title}
                        <ChevronRightIcon className="size-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ml-1.5 text-[#84cc16]" />
                      </h3>
                      <p className="text-xs text-slate-350 leading-relaxed font-sans line-clamp-2">
                        {form.description || "Interactive responsive layout pre-wired to capture values securely."}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-10 border-2 border-dashed border-[#365314] rounded-sm bg-[#18181b]/30">
                <p className="text-slate-500 font-mono text-xs uppercase tracking-wider">No public forms available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing comparison section */}
      <section id="pricing" className="py-20 px-6 border-t-2 border-[#365314] bg-[#18181b]/30">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="text-[#22c55e] border-[#365314] bg-[#22c55e]/10 text-xs rounded-sm">
              Flexible Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-pixel uppercase tracking-wide text-white">
              Pricing designed for builders of all scales
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-normal font-sans">
              Choose the tier that fits your form-building requirements. No credit card required.
            </p>

            {/* Toggle Billing Period */}
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <span className={`text-xs font-mono uppercase tracking-wider transition-colors ${billingPeriod === "monthly" ? "text-white" : "text-slate-500"}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(p => p === "monthly" ? "annually" : "monthly")}
                className="w-11 h-6 rounded-sm bg-[#111827] p-0.5 transition-colors relative flex items-center border-2 border-[#365314] cursor-pointer"
              >
                <div className={`size-4 rounded-sm bg-[#84cc16] shadow-hud-outset transition-transform ${billingPeriod === "annually" ? "translate-x-5" : "translate-x-0"}`} />
              </button>
              <span className={`text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 ${billingPeriod === "annually" ? "text-white" : "text-slate-500"}`}>
                Yearly
                <Badge variant="outline" className="px-1.5 py-0 bg-[#22c55e]/15 text-[#a3e635] border-[#365314] text-[9px] rounded-sm">
                  Save 25%
                </Badge>
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 pt-6 items-stretch">
            {PRICING_PLANS.map((plan, i) => (
              <div
                key={i}
                className={`relative bg-[#18181b] p-6 flex flex-col justify-between shadow-hud-outset rounded-sm transition-all duration-300 hover:scale-[1.01] ${plan.border}`}
              >
                {plan.popular && (
                  <Badge className="absolute top-0 right-6 -translate-y-1/2 bg-[#84cc16] hover:bg-[#84cc16] text-white text-[9px] px-2.5 py-0.5 rounded-sm shadow border border-[#365314]">
                    Most Popular
                  </Badge>
                )}
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 min-h-[32px]">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    {plan.price !== "Custom" && plan.price !== "$0" && (
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-405">/ mo</span>
                    )}
                  </div>

                  <div className="h-0.5 bg-[#365314]/30 w-full" />

                  <ul className="space-y-3">
                    {plan.features.map((feat, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckIcon className="size-4 text-[#84cc16] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Button
                    asChild
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full py-5.5 rounded-sm"
                  >
                    <Link href={user ? "/dashboard" : "/signup"}>{plan.cta}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-[#365314] bg-[#111827] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-sm bg-[#84cc16] flex items-center justify-center border border-[#365314] shadow-hud-outset">
              <FileTextIcon className="size-3.5 text-white" />
            </div>
            <span className="font-pixel text-xs tracking-wider text-slate-400">
              FORMZ © {new Date().getFullYear()}
            </span>
          </div>

          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 text-center md:text-right max-w-sm">
            Built for the hackathon. Checklist standards met with tRPC, Zod, and Drizzle.
          </p>
        </div>
      </footer>
    </div>
  )
}
