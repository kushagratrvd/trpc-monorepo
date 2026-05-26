import * as React from "react"

import { cn } from "~/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-sm border-2 border-slate-800 bg-[#0f172a] px-3 py-1 text-slate-100 placeholder:text-slate-500 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)] transition-all outline-none font-sans text-sm selection:bg-[#84cc16] selection:text-white disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:border-[#22c55e] focus-visible:ring-[3px] focus-visible:ring-[#22c55e]/20",
        "aria-invalid:border-[#ef4444] aria-invalid:ring-[#ef4444]/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
