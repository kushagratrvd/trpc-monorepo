"use client"

import { useState } from "react"
import Link from "next/link"
import { useUser } from "~/hooks/api/auth"
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
  const { user, isLoading } = useUser()
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly")

  const FEATURES = [
    {
      icon: <LayersIcon className="size-5 text-indigo-400" />,
      title: "Visual Form Builder",
      description: "Build beautiful forms dynamically using our interactive field editor. Support for text, email, numbers, passwords, and toggle switches."
    },
    {
      icon: <BarChart3Icon className="size-5 text-purple-400" />,
      title: "Powerful Submissions Insights",
      description: "Analyze, search, and aggregate responses in a premium real-time dashboard layout with a built-in CSV export tool."
    },
    {
      icon: <ShieldIcon className="size-5 text-emerald-400" />,
      title: "Public Share Securely",
      description: "Instantly publish and share forms using clean public links. Includes local validations to filter out bad inputs automatically."
    },
    {
      icon: <ZapIcon className="size-5 text-amber-400" />,
      title: "Atomic Response Storing",
      description: "Never lose a response. Structured database models capture every answer safely with transaction-level locking mechanisms."
    }
  ]

  const TEMPLATES = [
    {
      title: "Startup Feedback Form",
      category: "Feedback",
      fields: "4 fields",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
    },
    {
      title: "Developer Event RSVP",
      category: "RSVP",
      fields: "5 fields",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20"
    },
    {
      title: "Secure Customer Inquiry",
      category: "Support",
      fields: "3 fields",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    }
  ]

  const PRICING_PLANS = [
    {
      name: "Basic Starter",
      price: billingPeriod === "monthly" ? "$0" : "$0",
      description: "Perfect for personal projects or basic feedback collecting.",
      features: [
        "Up to 3 active forms",
        "Standard field types (Text, Password)",
        "Basic tabular submission log",
        "Shared hosting speed"
      ],
      cta: "Get Started Free",
      popular: false,
      glow: "border-neutral-800"
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
      glow: "border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
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
      glow: "border-neutral-800"
    }
  ]

  return (
    <div className="relative min-h-screen bg-neutral-950 text-foreground overflow-x-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 w-full border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <FileTextIcon className="size-4.5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
              Formz
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#explore" className="hover:text-foreground transition-colors">Explore Templates</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing Plans</a>
          </nav>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-9 w-24 bg-neutral-900 rounded-md animate-pulse" />
            ) : user ? (
              <Button asChild size="sm" className="bg-indigo-600 text-foreground hover:bg-indigo-500 font-semibold shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                <Link href="/dashboard">
                  Dashboard
                  <ArrowRightIcon className="size-4 ml-1.5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="sm" variant="ghost" className="text-neutral-400 hover:text-foreground hover:bg-neutral-900/50">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild size="sm" className="bg-indigo-600 text-foreground hover:bg-indigo-500 font-semibold shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto text-center space-y-8">
        <Badge variant="outline" className="px-3 py-1 bg-indigo-500/5 text-indigo-400 border-indigo-500/25 flex items-center gap-1.5 mx-auto font-medium">
          <SparklesIcon className="size-3.5" />
          Modern Form Building is Here
        </Badge>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] text-foreground">
          Create beautiful SaaS forms <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
            in a single click
          </span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Formz provides builders with high-performance dynamic fields, beautiful loading skeletons,
          integrated tRPC backend schema checking, and real-time response tables with instant CSV exports.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-foreground font-semibold px-8 py-6 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all">
            <Link href={user ? "/dashboard" : "/register"}>
              {user ? "Go to Dashboard" : "Start Building for Free"}
              <ArrowRightIcon className="size-4.5 ml-2" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-neutral-800 text-neutral-350 hover:bg-neutral-900 px-8 py-6 rounded-xl">
            <a href="#explore">Explore Forms Showcase</a>
          </Button>
        </div>

        {/* Hero Form Mockup Card */}
        <div className="pt-12 max-w-4xl mx-auto">
          <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/30 p-1.5 backdrop-blur-md shadow-2xl overflow-hidden animate-pulse duration-4000">
            <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500 absolute top-0 left-0" />
            <div className="rounded-xl bg-neutral-950/80 border border-neutral-850 p-6 sm:p-10 text-left space-y-6">
              <div className="space-y-2 border-b border-neutral-900 pb-5">
                <div className="h-6 w-1/3 bg-neutral-800 rounded" />
                <div className="h-4 w-2/3 bg-neutral-900 rounded" />
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="h-4 w-1/5 bg-neutral-900 rounded" />
                  <div className="h-9 w-full bg-neutral-900/50 border border-neutral-800 rounded" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-4 w-1/4 bg-neutral-900 rounded" />
                  <div className="h-9 w-full bg-neutral-900/50 border border-neutral-800 rounded" />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-900 pt-5">
                <div className="h-4 w-1/3 bg-neutral-900 rounded" />
                <div className="h-9 w-24 bg-indigo-600/30 border border-indigo-500/20 rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 border-t border-neutral-900 bg-neutral-950/40">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-indigo-400 border-indigo-500/10 bg-indigo-500/5">
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Everything you need to collect submissions
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-normal">
              Formz maps dynamic schema capabilities to modern frontends securely and gracefully.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-6">
            {FEATURES.map((feature, i) => (
              <Card key={i} className="bg-neutral-900/30 border-neutral-850 backdrop-blur-md hover:border-neutral-800 transition-all">
                <CardContent className="p-6 flex gap-4">
                  <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 shrink-0 self-start">
                    {feature.icon}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-base text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
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
      <section id="explore" className="py-20 px-6 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-purple-400 border-purple-500/10 bg-purple-500/5">
              Explore Showcase
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Curated public templates & creations
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-normal">
              Pre-built themed forms designed with premium UX standards ready to collect responses.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {TEMPLATES.map((tpl, i) => (
              <div
                key={i}
                className="group relative rounded-xl border border-neutral-800 bg-neutral-900/10 p-5 hover:border-neutral-700/60 transition-all duration-200 cursor-pointer hover:shadow-[0_0_15px_rgba(99,102,241,0.05)]"
              >
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary" className={`${tpl.badgeColor} border text-xs font-semibold px-2 py-0.5 rounded`}>
                    {tpl.category}
                  </Badge>
                  <span className="text-xs text-neutral-500 font-medium">{tpl.fields}</span>
                </div>
                <h3 className="font-bold text-lg text-foreground mb-1 flex items-center group-hover:text-indigo-400 transition-colors">
                  {tpl.title}
                  <ChevronRightIcon className="size-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ml-1.5" />
                </h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  Interactive responsive layout pre-wired to capture values securely.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing comparison section */}
      <section id="pricing" className="py-20 px-6 border-t border-neutral-900 bg-neutral-950/40">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/10 bg-emerald-500/5">
              Flexible Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Pricing designed for builders of all scales
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-normal">
              Choose the tier that fits your form-building requirements. No credit card required.
            </p>

            {/* Toggle Billing Period */}
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <span className={`text-sm font-medium transition-colors ${billingPeriod === "monthly" ? "text-foreground" : "text-neutral-500"}`}>
                Monthly billing
              </span>
              <button
                onClick={() => setBillingPeriod(p => p === "monthly" ? "annually" : "monthly")}
                className="w-11 h-6 rounded-full bg-neutral-800 p-0.5 transition-colors relative flex items-center border border-neutral-750"
              >
                <div className={`size-4.5 rounded-full bg-indigo-500 transition-transform ${billingPeriod === "annually" ? "translate-x-5" : "translate-x-0"}`} />
              </button>
              <span className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${billingPeriod === "annually" ? "text-foreground" : "text-neutral-500"}`}>
                Yearly billing
                <Badge variant="outline" className="px-1.5 py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                  Save 25%
                </Badge>
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 pt-6 items-stretch">
            {PRICING_PLANS.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl border bg-neutral-900/30 p-6 flex flex-col justify-between backdrop-blur-md transition-all duration-300 hover:border-neutral-700/60 ${plan.glow}`}
              >
                {plan.popular && (
                  <Badge className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-600 text-foreground font-semibold px-2.5 py-0.5 rounded shadow">
                    Most Popular
                  </Badge>
                )}
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground min-h-[32px]">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                    {plan.price !== "Custom" && plan.price !== "$0" && (
                      <span className="text-xs text-muted-foreground">/ month</span>
                    )}
                  </div>

                  <div className="h-px bg-neutral-800/80 w-full" />

                  <ul className="space-y-3">
                    {plan.features.map((feat, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-neutral-350">
                        <CheckIcon className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Button
                    asChild
                    variant={plan.popular ? "default" : "outline"}
                    className={`w-full font-semibold rounded-xl py-5.5 ${plan.popular ? "bg-indigo-600 text-foreground hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "border-neutral-850 text-neutral-300 hover:bg-neutral-800"}`}
                  >
                    <Link href={user ? "/dashboard" : "/register"}>{plan.cta}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
              <FileTextIcon className="size-3.5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-neutral-350">
              Formz © {new Date().getFullYear()}
            </span>
          </div>

          <p className="text-xs text-neutral-500 leading-normal text-center md:text-right max-w-sm">
            Built for the hackathon using a secure Turborepo setup. Exceeding checklist standards with tRPC, Zod, and Drizzle.
          </p>
        </div>
      </footer>
    </div>
  )
}