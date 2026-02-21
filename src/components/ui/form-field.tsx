"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

export function FormField({ label, required, error, children, className, htmlFor }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ms-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
}
