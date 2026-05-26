import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "~/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-sm text-sm font-semibold transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-[#84cc16] text-white border-b-4 border-r-4 border-[#365314] hover:bg-[#22c55e] hover:border-[#1e3a07] active:border-b-2 active:border-r-2 active:translate-y-[2px] shadow-hud-outset",
        destructive:
          "bg-[#ef4444] text-white border-b-4 border-r-4 border-[#7f1d1d] hover:bg-red-500 hover:border-red-900 active:border-b-2 active:border-r-2 active:translate-y-[2px] shadow-hud-outset",
        outline:
          "border-b-4 border-r-4 border-slate-800 bg-slate-900 text-slate-100 hover:bg-slate-800 active:border-b-2 active:border-r-2 active:translate-y-[2px] shadow-hud-outset",
        secondary:
          "bg-slate-800 text-slate-200 border-b-4 border-r-4 border-slate-950 hover:bg-slate-700 active:border-b-2 active:border-r-2 active:translate-y-[2px] shadow-hud-outset",
        ghost:
          "border-2 border-transparent bg-transparent text-slate-400 hover:bg-slate-800/80 hover:text-white active:bg-slate-850",
        link: "text-[#84cc16] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-sm px-2 text-[10px] uppercase tracking-wider font-mono has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-sm px-3 text-xs uppercase tracking-wider font-mono has-[>svg]:px-2.5",
        lg: "h-10 rounded-sm px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-sm uppercase tracking-wider font-mono [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 uppercase tracking-wider font-mono text-xs",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
