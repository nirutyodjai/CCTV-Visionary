"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { cn } from "@/lib/utils"

const RadioTileGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn("grid gap-2", className)}
      {...props}
    />
  )
})
RadioTileGroup.displayName = "RadioTileGroup"

const RadioTileItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    icon: React.ReactNode
    label: string
  }
>(({ className, icon, label, ...props }, ref) => {
  return (
    <label className={cn("cursor-pointer", className)}>
        <RadioGroupPrimitive.Item
            ref={ref}
            className="peer sr-only"
            {...props}
        />
        <div
        className={cn(
            "flex flex-col items-center justify-center p-1 w-full min-h-[70px] rounded-lg border-2 border-muted bg-card",
            "transition-all shadow-sm",
            "peer-data-[state=checked]:border-primary peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:text-primary",
            "hover:border-primary/70"
        )}
        >
            <div className="w-8 h-8 flex items-center justify-center peer-data-[state=checked]:[&>svg]:text-primary [&>svg]:text-muted-foreground [&>svg]:w-7 [&>svg]:h-7">
                {icon}
            </div>
            <span className="text-xs text-center font-medium mt-1">
                {label}
            </span>
        </div>
    </label>
  )
})
RadioTileItem.displayName = "RadioTileItem"

export { RadioTileGroup, RadioTileItem }
