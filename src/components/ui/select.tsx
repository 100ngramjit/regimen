"use client"

import * as React from "react"
import * as Select from "@base-ui/react/select"
import * as Separator from "@base-ui/react/separator"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

const SelectRoot = Select.Select.Root

const SelectGroup = Select.Select.Group

const SelectValue = Select.Select.Value

const SelectTriggerComponent = React.forwardRef<
  React.ElementRef<typeof Select.Select.Trigger>,
  React.ComponentPropsWithoutRef<typeof Select.Select.Trigger> & {
    size?: "sm" | "default" | "lg"
  }
>(({ className, size = "default", children, ...props }, ref) => (
  <Select.Select.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 cursor-pointer",
      size === "sm" && "h-8 px-2 text-xs",
      size === "lg" && "h-10 px-4",
      className
    )}
    {...props}
  >
    {children}
    <Select.Select.Icon>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </Select.Select.Icon>
  </Select.Select.Trigger>
))
SelectTriggerComponent.displayName = "SelectTrigger"

const SelectPopupComponent = React.forwardRef<
  React.ElementRef<typeof Select.Select.Popup>,
  React.ComponentPropsWithoutRef<typeof Select.Select.Popup> & {
    alignItemWithTrigger?: boolean
  }
>(({ className, children, alignItemWithTrigger = true, ...props }, ref) => (
  <Select.Select.Portal>
    <Select.Select.Positioner>
      <Select.Select.Popup
        ref={ref}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-background text-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        <Select.Select.ScrollUpArrow className="flex cursor-default items-center justify-center py-1">
          <ChevronUp className="h-4 w-4" />
        </Select.Select.ScrollUpArrow>
        <Select.Select.List
          className={cn(
            "p-1",
            alignItemWithTrigger && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </Select.Select.List>
        <Select.Select.ScrollDownArrow className="flex cursor-default items-center justify-center py-1">
          <ChevronDown className="h-4 w-4" />
        </Select.Select.ScrollDownArrow>
      </Select.Select.Popup>
    </Select.Select.Positioner>
  </Select.Select.Portal>
))
SelectPopupComponent.displayName = "SelectPopup"

const SelectContent = SelectPopupComponent

const SelectLabelComponent = React.forwardRef<
  React.ElementRef<typeof Select.Select.Label>,
  React.ComponentPropsWithoutRef<typeof Select.Select.Label>
>(({ className, ...props }, ref) => (
  <Select.Select.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabelComponent.displayName = "SelectLabel"

const SelectItemComponent = React.forwardRef<
  React.ElementRef<typeof Select.Select.Item>,
  React.ComponentPropsWithoutRef<typeof Select.Select.Item>
>(({ className, children, ...props }, ref) => (
  <Select.Select.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <Select.Select.ItemIndicator>
        <Check className="h-4 w-4" />
      </Select.Select.ItemIndicator>
    </span>
    <Select.Select.ItemText>{children}</Select.Select.ItemText>
  </Select.Select.Item>
))
SelectItemComponent.displayName = "SelectItem"

const SelectSeparatorComponent = React.forwardRef<
  React.ElementRef<typeof Separator.Separator>,
  React.ComponentPropsWithoutRef<typeof Separator.Separator>
>(({ className, ...props }, ref) => (
  <Separator.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparatorComponent.displayName = "SelectSeparator"

export {
  SelectRoot as Select,
  SelectGroup,
  SelectValue,
  SelectTriggerComponent as SelectTrigger,
  SelectPopupComponent as SelectPopup,
  SelectContent,
  SelectLabelComponent as SelectLabel,
  SelectItemComponent as SelectItem,
  SelectSeparatorComponent as SelectSeparator,
}
