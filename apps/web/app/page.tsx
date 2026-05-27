"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useUser } from "~/hooks/api/auth"
import { useListPublicForms } from "~/hooks/api/form"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"


export default function Home() {
  const { user } = useUser()
  const { publicForms, isLoading: isFormsLoading } = useListPublicForms()
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly")

  const FEATURES = [
    {
      icon: <Image src="/assets/minecraft/blocks/Crafting_Table.png" width={48} height={48} alt="" style={{ imageRendering: "pixelated" }} />,
      title: "Visual Form Builder",
      description: "Build beautiful forms dynamically using our interactive field editor. Support for text, email, numbers, passwords, and toggle switches."
    },
    {
      icon: <Image src="/assets/minecraft/blocks/Bookshelf.png" width={48} height={48} alt="" style={{ imageRendering: "pixelated" }} />,
      title: "Powerful Submissions Insights",
      description: "Analyze, search, and aggregate responses in a premium real-time dashboard layout with a built-in CSV export tool."
    },
    {
      icon: <Image src="/assets/minecraft/blocks/Bedrock.png" width={48} height={48} alt="" style={{ imageRendering: "pixelated" }} />,
      title: "Public Share Securely",
      description: "Instantly publish and share forms using clean public links. Includes local validations to filter out bad inputs automatically."
    },
    {
      icon: <Image src="/assets/minecraft/blocks/Barrel.png" width={48} height={48} alt="" style={{ imageRendering: "pixelated" }} />,
      title: "Reliable Response Storage",
      description: "Never lose a response. Structured database models capture every answer with validation before it is saved."
    }
  ]

  const STATS = [
    { value: "12,400+", label: "Forms Created", icon: <Image src="/assets/minecraft/blocks/Anvil.png" width={48} height={48} alt="" style={{ imageRendering: "pixelated" }} /> },
    { value: "98,000+", label: "Responses Collected", icon: <Image src="/assets/minecraft/blocks/Chest.png" width={48} height={48} alt="" style={{ imageRendering: "pixelated" }} /> },
    { value: "3,200+", label: "Active Builders", icon: <Image src="/assets/minecraft/blocks/Carved_Pumpkin.png" width={48} height={48} alt="" style={{ imageRendering: "pixelated" }} /> },
    { value: "99.9%", label: "Uptime SLA", icon: <Image src="/assets/minecraft/blocks/Beacon.png" width={48} height={48} alt="" style={{ imageRendering: "pixelated" }} /> },
  ]

  const HOW_IT_WORKS = [
    {
      step: "01",
      icon: <Image src="/assets/minecraft/items/Diamond_Pickaxe.png" width={64} height={64} alt="Design" style={{ imageRendering: "pixelated" }} />,
      title: "Design Your Form",
      description: "Use the drag-and-drop editor to add fields, configure validations, pick a Minecraft theme, and craft the perfect form experience in minutes.",
      block: "Crafting_Table"
    },
    {
      step: "02",
      icon: <Image src="/assets/minecraft/items/Ender_Eye.png" width={64} height={64} alt="Share" style={{ imageRendering: "pixelated" }} />,
      title: "Publish & Share",
      description: "Toggle visibility between Public or Unlisted, copy your unique shareable link, or generate a QR code. No login required for respondents.",
      block: "Compass"
    },
    {
      step: "03",
      icon: <Image src="/assets/minecraft/blocks/Chest.png" width={64} height={64} alt="Collect" style={{ imageRendering: "pixelated" }} />,
      title: "Collect & Analyze",
      description: "Watch responses flow in real-time. Export to CSV, view analytics, filter submissions, and get email notifications for every new entry.",
      block: "Chest"
    },
  ]


  const TESTIMONIALS = [
    {
      quote: "Formz made collecting feedback for my game server community incredibly smooth. The Minecraft theme was an instant hit with my players.",
      author: "xCraftMaster",
      role: "Server Admin · 2,400 players",
      avatar: "XC",
      stars: 5,
    },
    {
      quote: "I replaced three different tools with Formz. The tRPC API is clean, the analytics are real, and the forms just work. No fuss.",
      author: "Priya Nair",
      role: "Full-Stack Developer",
      avatar: "PN",
      stars: 5,
    },
    {
      quote: "We used Formz for our indie game jam registration. Unlisted form links kept things exclusive, and the CSV export saved hours of manual work.",
      author: "StudioBlox",
      role: "Indie Game Studio",
      avatar: "SB",
      stars: 5,
    },
  ]

  const BONUS_FEATURES = [
    { icon: <Image src="/assets/minecraft/blocks/Command_Block.png" width={16} height={16} alt="" style={{ imageRendering: "pixelated" }} />, label: "QR Code Sharing", color: "text-[#84cc16]", border: "border-[#84cc16]/30" },
    { icon: <Image src="/assets/minecraft/blocks/Chest.png" width={16} height={16} alt="" style={{ imageRendering: "pixelated" }} />, label: "CSV Export", color: "text-[#a3e635]", border: "border-[#a3e635]/30" },
    { icon: <Image src="/assets/minecraft/blocks/Bedrock.png" width={16} height={16} alt="" style={{ imageRendering: "pixelated" }} />, label: "Password-Protected Forms", color: "text-blue-400", border: "border-blue-400/30" },
    { icon: <Image src="/assets/minecraft/blocks/Crafter.png" width={16} height={16} alt="" style={{ imageRendering: "pixelated" }} />, label: "Form Cloning", color: "text-amber-400", border: "border-amber-400/30" },
    { icon: <Image src="/assets/minecraft/blocks/Bookshelf.png" width={16} height={16} alt="" style={{ imageRendering: "pixelated" }} />, label: "API Documentation", color: "text-purple-400", border: "border-purple-400/30" },
    { icon: <Image src="/assets/minecraft/blocks/Bell.png" width={16} height={16} alt="" style={{ imageRendering: "pixelated" }} />, label: "Custom Slugs", color: "text-cyan-400", border: "border-cyan-400/30" },
    { icon: <Image src="/assets/minecraft/blocks/Cauldron.png" width={16} height={16} alt="" style={{ imageRendering: "pixelated" }} />, label: "Analytics Dashboard", color: "text-yellow-400", border: "border-yellow-400/30" },
    { icon: <Image src="/assets/minecraft/blocks/Composter.png" width={16} height={16} alt="" style={{ imageRendering: "pixelated" }} />, label: "Form Templates", color: "text-pink-400", border: "border-pink-400/30" },
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
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/3 h-[500px] w-[500px] bg-lime-500/5 blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 h-[400px] w-[400px] bg-emerald-500/5 blur-3xl pointer-events-none -z-10" />

      {/* ── HERO ── */}
      <section
        className="relative w-full min-h-screen flex flex-col justify-center items-center text-center bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/assets/minecraft/homepage.png')" }}
      >
        <header className="absolute top-0 left-0 right-0 w-full bg-gradient-to-b from-black/40 to-transparent z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/assets/minecraft/blocks/Crafting_Table.png" width={40} height={40} alt="" style={{ imageRendering: "pixelated" }} />
              <span className="font-pixel font-bold text-xl tracking-wider text-white">FORMZ</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-200">
              <a href="#features" className="hover:text-[#84cc16] transition-colors drop-shadow-md">Features</a>
              <a href="#how-it-works" className="hover:text-[#84cc16] transition-colors drop-shadow-md">How It Works</a>
              <a href="#explore" className="hover:text-[#84cc16] transition-colors drop-shadow-md">Explore Templates</a>
              <a href="#pricing" className="hover:text-[#84cc16] transition-colors drop-shadow-md">Pricing</a>
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <Button asChild size="sm" variant="default">
                  <Link href="/dashboard">
                    Get Started <Image src="/assets/minecraft/items/Arrow.png" width={16} height={16} alt="→" style={{ imageRendering: "pixelated" }} className="ml-1.5" />
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

        <div className="absolute inset-0 pointer-events-none z-10" />

        <div className="relative z-20 space-y-8 px-6 max-w-4xl mx-auto flex flex-col items-center pt-60">

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-pixel uppercase tracking-wide text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.95)] leading-tight pt-30">
            Build Forms.<br />
            <span className="text-[#84cc16]">Mine Responses.</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] font-medium font-sans">
            Create stunning, responsive forms with a Minecraft twist. Publish, share, and collect responses — no respondent login required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
            <Button asChild size="lg" className="w-full sm:w-auto text-base px-8 py-6 rounded-sm bg-[#84cc16] text-white border-b-4 border-r-4 border-[#365314] hover:bg-[#22c55e] hover:border-[#1e3a07]">
              <Link href={user ? "/dashboard" : "/signup"}>
                {user ? "Go to Dashboard" : "Start Building for Free"}
                <Image src="/assets/minecraft/items/Arrow.png" width={16} height={16} alt="→" style={{ imageRendering: "pixelated" }} className="ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 rounded-sm border-2 border-white/30 text-white hover:bg-white/10">
              <a href="#how-it-works">
                See How It Works
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="py-10 px-6 border-y-2 border-[#365314] bg-[#111827]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-2 text-center">
                {stat.icon}
                <div className="text-2xl sm:text-3xl font-pixel text-white mt-2">{stat.value}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 px-6 border-b-2 border-[#365314]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-pixel uppercase tracking-wide text-white">
              Up and running in 3 steps
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-normal font-sans">
              From a blank canvas to a live form collecting real responses — in minutes, not days.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-0 pt-6 relative">

            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center px-6 gap-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-[#84cc16] font-pixel text-sm uppercase tracking-widest bg-[#18181b] border border-[#365314] px-2 py-1 rounded-sm">
                    Step {step.step}
                  </div>
                  {step.icon}
                </div>
                <h3 className="font-semibold text-base text-white">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" className="py-20 px-6 border-b-2 border-[#365314] bg-[#18181b]/30">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
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
                <CardContent className="p-6 flex gap-5 items-start">
                  {feature.icon}
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-white text-base">{feature.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── BONUS FEATURES ── */}
      <section className="py-20 px-6 border-b-2 border-[#365314]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-pixel uppercase tracking-wide text-white">
              Bonus capabilities included
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-normal font-sans">
              From password protection to real-time analytics — every feature is designed to empower your forms.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {BONUS_FEATURES.map((feature, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-sm bg-[#18181b] border ${feature.border} hover:border-[#84cc16]/50 transition-all`}
              >
                <span className="flex items-center justify-center">{feature.icon}</span>
                <span className={`text-xs font-mono uppercase tracking-wider ${feature.color}`}>{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEMPLATE EXPLORE ── */}
      <section id="explore" className="py-20 px-6 border-b-2 border-[#365314]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
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
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{form.fieldCount} fields</span>
                      </div>
                      <h3 className="font-semibold text-base text-white group-hover:text-[#84cc16] transition-colors line-clamp-1 flex items-center">
                        {form.title}
                        <Image src="/assets/minecraft/items/Arrow.png" width={12} height={12} alt=">" style={{ imageRendering: "pixelated" }} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ml-1.5" />
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-2">
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

          <div className="text-center pt-4">
            <Button asChild variant="outline" className="rounded-sm border-[#365314] text-slate-300 hover:border-[#84cc16]/50 hover:text-white">
              <Link href="/dashboard">
                Browse All Templates <Image src="/assets/minecraft/items/Arrow.png" width={16} height={16} alt="→" style={{ imageRendering: "pixelated" }} className="ml-1.5 inline-block" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-6 border-b-2 border-[#365314] bg-[#18181b]/30">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-pixel uppercase tracking-wide text-white">
              What builders are saying
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-[#18181b] border-2 border-[#365314] rounded-sm p-6 flex flex-col gap-4 shadow-hud-outset">
                <div className="flex gap-1">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Image key={s} src="/assets/minecraft/items/Amethyst_Shard.png" width={14} height={14} alt="Star" style={{ imageRendering: "pixelated" }} />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-sans flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-[#365314]/50 pt-4">
                  <div className="size-9 rounded-sm bg-[#84cc16]/15 border border-[#365314] flex items-center justify-center text-[10px] font-pixel text-[#84cc16]">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{t.author}</p>
                    <p className="text-[10px] text-slate-500 font-sans">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 px-6 border-b-2 border-[#365314]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-pixel uppercase tracking-wide text-white">
              Pricing designed for builders of all scales
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-normal font-sans">
              Choose the tier that fits your form-building requirements. No credit card required.
            </p>

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
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 pt-6 items-stretch">
            {PRICING_PLANS.map((plan, i) => (
              <div
                key={i}
                className={`relative bg-[#18181b] p-6 flex flex-col justify-between shadow-hud-outset rounded-sm transition-all duration-300 hover:scale-[1.01] ${plan.border}`}
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 min-h-[32px]">{plan.description}</p>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    {plan.price !== "Custom" && plan.price !== "$0" && (
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-500">/ mo</span>
                    )}
                  </div>
                  <div className="h-0.5 bg-[#365314]/30 w-full" />
                  <ul className="space-y-3">
                    {plan.features.map((feat, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-slate-300">
                        <Image src="/assets/minecraft/items/Amethyst_Shard.png" width={14} height={14} alt="✓" style={{ imageRendering: "pixelated" }} className="shrink-0 mt-0.5" />
                        <div>{feat}</div>
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

      {/* ── FAQ ── */}
      <section className="py-20 px-6 border-b-2 border-[#365314] bg-[#18181b]/30">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-pixel uppercase tracking-wide text-white">
              Common questions
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Do respondents need to create an account?",
                a: "No. Anyone with the form link can fill and submit a form without signing up. Only creators need an account to build and manage forms."
              },
              {
                q: "What is the difference between public and unlisted forms?",
                a: "Public forms appear in the explore gallery and template sections. Unlisted forms are published but hidden from public listings — only people with the direct link can access them."
              },
              {
                q: "Can I export my responses?",
                a: "Yes. Every form has a CSV export button in the responses dashboard. Download all submissions at any time with a single click."
              },
              {
                q: "Is there an API I can integrate with?",
                a: "Absolutely. Formz ships full API documentation powered by Scalar. You can interact with forms and responses programmatically using the documented tRPC-backed REST endpoints."
              },
            ].map((item, i) => (
              <div key={i} className="bg-[#18181b] border-2 border-[#365314] rounded-sm p-5 space-y-2">
                <h3 className="text-sm font-semibold text-[#84cc16]">{item.q}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-6 border-b-2 border-[#365314] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "url('/assets/minecraft/blocks/Blackstone.png')", backgroundRepeat: "repeat", backgroundSize: "128px", imageRendering: "pixelated" }}
        />
        <div className="relative max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-4xl sm:text-5xl font-pixel uppercase tracking-wide text-white leading-tight">
            Ready to start <br />
            <span className="text-[#84cc16]">crafting?</span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed font-sans">
            Join thousands of builders already using Formz. Your first form is free — no credit card, no setup, no waiting.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto text-base px-10 py-6 rounded-sm bg-[#84cc16] text-white border-b-4 border-r-4 border-[#365314] hover:bg-[#22c55e] hover:border-[#1e3a07]">
              <Link href={user ? "/dashboard" : "/signup"}>
                {user ? "Open Dashboard" : "Create Your First Form"}
                <Image src="/assets/minecraft/items/Arrow.png" width={16} height={16} alt="→" style={{ imageRendering: "pixelated" }} className="ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="w-full sm:w-auto text-base px-8 py-6 rounded-sm text-slate-400 hover:text-white">
              <Link href="/docs">View API Docs</Link>
            </Button>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 pt-2">
            Free forever on the starter plan · No credit card required
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t-2 border-[#365314] bg-[#111827] py-12 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Image src="/assets/minecraft/blocks/Crafting_Table.png" width={32} height={32} alt="" style={{ imageRendering: "pixelated" }} />
                <span className="font-pixel text-sm tracking-wider text-white">FORMZ</span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                A Minecraft-themed form builder SaaS. Built for hackers, indie devs, and community leaders.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Product</p>
              <ul className="space-y-2">
                {["Features", "Pricing", "API Docs", "Changelog"].map(l => (
                  <li key={l}><a href="#" className="text-xs text-slate-400 hover:text-[#84cc16] transition-colors font-sans">{l}</a></li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Explore</p>
              <ul className="space-y-2">
                {["Templates", "Public Forms", "Themes", "Community"].map(l => (
                  <li key={l}><a href="#" className="text-xs text-slate-400 hover:text-[#84cc16] transition-colors font-sans">{l}</a></li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Stack</p>
              <ul className="space-y-2">
                {["tRPC", "Drizzle ORM", "Zod", "Turborepo", "Scalar Docs"].map(l => (
                  <li key={l}><span className="text-xs text-slate-500 font-mono">{l}</span></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-[#365314]/50 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-pixel text-xs tracking-wider text-slate-500">
              FORMZ © {new Date().getFullYear()}
            </span>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 text-center md:text-right max-w-sm">
              Built for the hackathon · tRPC · Zod · Drizzle · Turborepo · Scalar
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}