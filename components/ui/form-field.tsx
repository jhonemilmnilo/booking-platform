import * as React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  error?: string
  required?: boolean
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, required, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-2 w-full", className)}
        {...props}
      >
        {label && (
          <Label className={cn(error && "text-destructive")}>
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
        )}
        {children}
        {error && (
          <p className="text-xs font-medium text-destructive transition-all animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = "FormField"

export { FormField }
