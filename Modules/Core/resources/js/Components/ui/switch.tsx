import * as React from "react"

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className = '', ...props }, ref) => (
    <label className={`inline-flex items-center cursor-pointer ${className}`}>
      <input
        ref={ref}
        type="checkbox"
        className="sr-only peer"
        {...props}
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:bg-primary transition-all"></div>
      {label && <span className="ml-2 text-sm">{label}</span>}
    </label>
  )
)

Switch.displayName = "Switch"
