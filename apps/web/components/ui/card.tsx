import * as React from "react"

import { cn } from "~/lib/utils"

function Card({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "relative overflow-hidden rounded-none",
        className
      )}
      {...props}
    >
      {/* dirt texture */}
      {/*<div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/assets/minecraft/blocks/dirt.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "48px",
          imageRendering: "pixelated",
        }}
      />*/}

      {/* grass top strip */}
      <div
        className="absolute top-0 left-0 w-full h-4 pointer-events-none z-[1]"
        style={{
          backgroundImage: "url('/assets/minecraft/blocks/grass.png')",
          backgroundRepeat: "repeat-x",
          backgroundSize: "60px",
          imageRendering: "pixelated",
        }}
      />

      {/* content */}
      <div className="relative z-10 flex flex-col gap-4 p-5 pt-5">
        {children}
      </div>
    </div>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min gap-2",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold text-lg text-white", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-xs text-slate-400 font-sans leading-relaxed", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "font-sans text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
