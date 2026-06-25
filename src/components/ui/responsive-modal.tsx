"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * ResponsiveModal — a single Radix Dialog that renders as a bottom sheet on
 * mobile and a centered, width-limited modal on desktop (md+). Because Sheet
 * and Dialog both wrap @radix-ui/react-dialog, the breakpoint switch is purely
 * CSS — no JS branching, no remount when the viewport crosses the breakpoint.
 */

const ResponsiveModal = DialogPrimitive.Root

const ResponsiveModalTrigger = DialogPrimitive.Trigger

const ResponsiveModalClose = DialogPrimitive.Close

const ResponsiveModalPortal = DialogPrimitive.Portal

const ResponsiveModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
ResponsiveModalOverlay.displayName = "ResponsiveModalOverlay"

const contentVariants = cva(
  cn(
    // shared — overflow-hidden clips child backgrounds (e.g. a bg-bg footer)
    // to the rounded corners; without it square child rects paint over them.
    "fixed z-50 flex flex-col overflow-hidden bg-background shadow-lg transition ease-in-out",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:duration-300 data-[state=open]:duration-500",
    // mobile: bottom sheet
    "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[20px] border-t",
    "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
    // desktop: centered modal
    "md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
    "md:w-[calc(100%-2rem)] md:h-auto md:max-h-[88vh] md:rounded-[18px] md:border",
    "md:data-[state=closed]:slide-out-to-bottom-0 md:data-[state=open]:slide-in-from-bottom-0",
    "md:data-[state=closed]:zoom-out-95 md:data-[state=open]:zoom-in-95",
    "md:data-[state=closed]:duration-200 md:data-[state=open]:duration-200"
  ),
  {
    variants: {
      size: {
        md: "md:max-w-[560px]",
        lg: "md:max-w-[880px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

interface ResponsiveModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof contentVariants> {
  /** Hide the built-in top-right close button (component renders its own). */
  hideClose?: boolean
}

const ResponsiveModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ResponsiveModalContentProps
>(({ className, children, size, hideClose, ...props }, ref) => (
  <ResponsiveModalPortal>
    <ResponsiveModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(contentVariants({ size }), className)}
      {...props}
    >
      {children}
      {!hideClose && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Schließen</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </ResponsiveModalPortal>
))
ResponsiveModalContent.displayName = "ResponsiveModalContent"

const ResponsiveModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-left", className)} {...props} />
)
ResponsiveModalHeader.displayName = "ResponsiveModalHeader"

const ResponsiveModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
)
ResponsiveModalFooter.displayName = "ResponsiveModalFooter"

const ResponsiveModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
ResponsiveModalTitle.displayName = "ResponsiveModalTitle"

const ResponsiveModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
ResponsiveModalDescription.displayName = "ResponsiveModalDescription"

export {
  ResponsiveModal,
  ResponsiveModalPortal,
  ResponsiveModalOverlay,
  ResponsiveModalTrigger,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
}
