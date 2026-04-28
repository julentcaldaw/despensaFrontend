import type { InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hideLabel?: boolean
}

export function TextField({
  id,
  label,
  error,
  hideLabel = false,
  className,
  ...props
}: TextFieldProps) {
  return (
    <div className="w-full space-y-2">
      {hideLabel ? null : (
        <label className="label px-0 pb-0" htmlFor={id}>
          <span className="label-text font-medium text-base-content">{label}</span>
        </label>
      )}
      <input
        id={id}
        aria-label={props['aria-label'] ?? label}
        className={`input input-bordered w-full ${error ? 'input-error' : ''} ${className ?? ''}`.trim()}
        {...props}
      />
      {error ? (
        <p className="label px-0 pt-0 text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
