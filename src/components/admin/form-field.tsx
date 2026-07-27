import { forwardRef } from "react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="mb-4">
        <label className="text-foreground block text-sm font-medium">
          {label}
        </label>
        <input
          ref={ref}
          className={`border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring mt-2 w-full rounded-lg border px-4 py-2 transition-colors focus-visible:ring-2 focus-visible:outline-none ${className || ""}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

FormField.displayName = "FormField";
