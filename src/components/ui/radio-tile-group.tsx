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
  }
>(({ className, icon, ...props }, ref) => {
  return (
    // The Radix Item is the core component. It behaves like a button.
    // With `asChild`, we tell it to use our custom div for its rendering,
    // while passing all necessary accessibility and interaction props to it.
    <RadioGroupPrimitive.Item
        ref={ref}
        {...props}
        className={cn("peer", className)}
        asChild
    >
      <div
      className={cn(
          "flex flex-col items-center justify-center p-1 w-full h-14 rounded-lg border-2 border-muted bg-card",
          "transition-all shadow-sm cursor-pointer",
          // These styles apply based on the state of the 'peer' (the RadioGroup.Item)
          "peer-data-[state=checked]:border-primary peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:text-primary",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
          "hover:border-primary/70"
      )}
      >
          <div className="w-8 h-8 flex items-center justify-center peer-data-[state=checked]:[&>svg]:text-primary [&>svg]:text-muted-foreground [&>svg]:w-7 [&>svg]:h-7">
              {icon}
          </div>
      </div>
    </RadioGroupPrimitive.Item>
  )
})
RadioTileItem.displayName = "RadioTileItem"

export { RadioTileGroup, RadioTileItem }
