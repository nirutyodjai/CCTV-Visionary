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
  // Use a unique ID if one isn't provided, for the label to reference.
  const id = React.useId();
  const inputId = props.id || id;

  return (
    // The label makes the entire area clickable.
    <label htmlFor={inputId}>
      {/* The actual radio input is hidden but accessible. */}
      <RadioGroupPrimitive.Item
        ref={ref}
        id={inputId}
        {...props}
        className={cn("sr-only peer", className)}
      />
      {/* This is the visible part of the tile. */}
      <div
        className={cn(
          "flex flex-col items-center justify-center p-1 w-full h-14 rounded-lg border-2 border-muted bg-card",
          "transition-all shadow-sm cursor-pointer",
          "text-muted-foreground",
          // These styles apply based on the state of the 'peer' (the radio input)
          "peer-data-[state=checked]:border-primary peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:text-primary",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
          "hover:border-primary/70"
        )}
      >
        <div className="w-8 h-8 flex items-center justify-center [&>svg]:w-7 [&>svg]:h-7">
            {icon}
        </div>
      </div>
    </label>
  )
})
RadioTileItem.displayName = "RadioTileItem"

export { RadioTileGroup, RadioTileItem }
