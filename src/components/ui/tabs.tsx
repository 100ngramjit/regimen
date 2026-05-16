"use client"

import * as React from "react"
import * as Tabs from "@base-ui/react/tabs"
import { cn } from "@/lib/utils"

const TabsComponent = React.forwardRef<
  React.ElementRef<typeof Tabs.Tabs.Root>,
  React.ComponentPropsWithoutRef<typeof Tabs.Tabs.Root> & {
    variant?: "default" | "underline"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <Tabs.Tabs.Root
    ref={ref}
    className={cn(
      variant === "underline" && "border-b",
      className
    )}
    {...props}
  />
))
TabsComponent.displayName = "Tabs"

const TabsListComponent = React.forwardRef<
  React.ElementRef<typeof Tabs.Tabs.List>,
  React.ComponentPropsWithoutRef<typeof Tabs.Tabs.List> & {
    variant?: "default" | "underline"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <Tabs.Tabs.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      variant === "underline" && "bg-transparent p-0",
      className
    )}
    {...props}
  />
))
TabsListComponent.displayName = "TabsList"

const TabsTabComponent = React.forwardRef<
  React.ElementRef<typeof Tabs.Tabs.Tab>,
  React.ComponentPropsWithoutRef<typeof Tabs.Tabs.Tab>
>(({ className, ...props }, ref) => (
  <Tabs.Tabs.Tab
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer",
      className
    )}
    {...props}
  />
))
TabsTabComponent.displayName = "TabsTab"

const TabsPanelComponent = React.forwardRef<
  React.ElementRef<typeof Tabs.Tabs.Panel>,
  React.ComponentPropsWithoutRef<typeof Tabs.Tabs.Panel>
>(({ className, ...props }, ref) => (
  <Tabs.Tabs.Panel
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsPanelComponent.displayName = "TabsPanel"

export { TabsComponent as Tabs, TabsListComponent as TabsList, TabsTabComponent as TabsTab, TabsPanelComponent as TabsPanel }
