"use client"

import * as React from "react"
import * as Avatar from "@base-ui/react/avatar"
import { cn } from "@/lib/utils"

const AvatarRoot = React.forwardRef<
  React.ElementRef<typeof Avatar.Avatar.Root>,
  React.ComponentPropsWithoutRef<typeof Avatar.Avatar.Root>
>(({ className, ...props }, ref) => (
  <Avatar.Avatar.Root
    ref={ref}
    className={cn(
      "relative flex size-8 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
AvatarRoot.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof Avatar.Avatar.Image>,
  React.ComponentPropsWithoutRef<typeof Avatar.Avatar.Image>
>(({ className, ...props }, ref) => (
  <Avatar.Avatar.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof Avatar.Avatar.Fallback>,
  React.ComponentPropsWithoutRef<typeof Avatar.Avatar.Fallback>
>(({ className, ...props }, ref) => (
  <Avatar.Avatar.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { AvatarRoot as Avatar, AvatarImage, AvatarFallback }
