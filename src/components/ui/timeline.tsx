"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  iconsize?: "sm" | "md" | "lg";
}

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  index?: number;
  date?: Date | string | number;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  iconColor?: "primary" | "secondary" | "muted" | "accent";
  status?: "completed" | "in-progress" | "pending";
  loading?: boolean;
  error?: string;
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ className, size = "md", iconsize = "md", ...props }, ref) => (
    <div ref={ref} className={cn("space-y-8", className)} {...props} />
  )
);
Timeline.displayName = "Timeline";

const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  (
    {
      className,
      index,
      date,
      title,
      description,
      icon,
      iconColor = "primary",
      status = "completed",
      loading = false,
      error,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "relative pl-8 md:pl-0 md:grid md:grid-cols-5 md:gap-10 group",
        className
      )}
      {...props}
    />
  )
);
TimelineItem.displayName = "TimelineItem";

const TimelineMarker = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { icon?: React.ReactNode }
>(({ className, icon, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute left-0 md:relative md:col-span-1 flex justify-center",
      className
    )}
    {...props}
  >
    <div className="h-12 w-12 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md z-10">
      {icon}
    </div>
    <div className="absolute top-12 bottom-0 left-1/2 w-0.5 bg-sky-200 -translate-x-1/2 group-last:hidden" />
  </div>
));
TimelineMarker.displayName = "TimelineMarker";

const TimelineContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("md:col-span-4 pt-1", className)} {...props} />
));
TimelineContent.displayName = "TimelineContent";

const TimelineDate = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sky-600 font-medium", className)}
    {...props}
  />
));
TimelineDate.displayName = "TimelineDate";

const TimelineTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-xl font-semibold tracking-tight", className)}
    {...props}
  />
));
TimelineTitle.displayName = "TimelineTitle";

const TimelineDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-muted-foreground", className)} {...props} />
));
TimelineDescription.displayName = "TimelineDescription";

export {
  Timeline,
  TimelineItem,
  TimelineMarker,
  TimelineContent,
  TimelineDate,
  TimelineTitle,
  TimelineDescription,
  type TimelineProps,
  type TimelineItemProps,
};
