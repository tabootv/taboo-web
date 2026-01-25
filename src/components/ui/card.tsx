import * as React from "react"

import { cn } from "@/shared/utils/formatting"

function Card({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        // Shape
        "relative rounded-2xl overflow-hidden",
        // Background gradient matching Framer style
        "bg-gradient-to-b from-white/[0.05] to-white/[0.02]",
        // Border
        "border border-white/[0.08]",
        // Hover effects
        "transition-all duration-300 ease-out",
        "hover:-translate-y-2 hover:scale-[1.02]",
        "hover:shadow-[0_20px_40px_rgba(171,0,19,0.25)]",
        // Layout
        "flex flex-col text-card-foreground",
        className
      )}
      {...props}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,rgba(171,0,19,0.1)_0%,transparent_70%)] opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
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
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [&.border-b]:pb-6 [&.border-b]:border-white/10",
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
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
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
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [&.border-t]:pt-6 [&.border-t]:border-white/10", className)}
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
