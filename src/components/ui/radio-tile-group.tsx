
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
    <RadioGroupPrimitive.Item
      ref={ref}
      {...props}
      className={cn(className)}
      asChild
    >
      <div
      className={cn(
          "flex flex-col items-center justify-center p-1 w-full h-14 rounded-lg border-2 border-muted bg-card",
          "transition-all shadow-sm cursor-pointer",
          "text-muted-foreground", // Default icon color
          // These styles apply based on the state of the 'peer' (the RadioGroup.Item)
          "data-[state=checked]:border-primary data-[state=checked]:shadow-lg data-[state=checked]:text-primary",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "hover:border-primary/70"
      )}
      >
          <div className="w-8 h-8 flex items-center justify-center [&>svg]:w-7 [&>svg]:h-7">
              {icon}
          </div>
      </div>
    </RadioGroupPrimitive.Item>
  )
})
RadioTileItem.displayName = "RadioTileItem"

export { RadioTileGroup, RadioTileItem }
