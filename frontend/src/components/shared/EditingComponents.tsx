import React from 'react'

// Shared form input component with consistent styling
interface FormInputProps {
  label: string
  value: string | number
  onChange: (value: string | number) => void
  type?: 'text' | 'number' | 'email' | 'tel' | 'url' | 'date'
  placeholder?: string
  required?: boolean
  error?: string
  helpText?: string
  min?: number
  max?: number
  autoFocus?: boolean
  disabled?: boolean
}

export function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  error,
  helpText,
  min,
  max,
  autoFocus = false,
  disabled = false
}: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
        {helpText && <span className="text-slate-500 font-normal"> ({helpText})</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
        } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
        placeholder={placeholder}
        min={min}
        max={max}
        autoFocus={autoFocus}
        disabled={disabled}
      />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  )
}

// Shared textarea component
interface FormTextareaProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  helpText?: string
  rows?: number
  disabled?: boolean
}

export function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helpText,
  rows = 3,
  disabled = false
}: FormTextareaProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
        {helpText && <span className="text-slate-500 font-normal"> ({helpText})</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors ${
          error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
        } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
      />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  )
}

// Shared select component
interface FormSelectProps {
  label: string
  value: string | number
  onChange: (value: string | number) => void
  options: { value: string | number; label: string; icon?: string }[]
  placeholder?: string
  required?: boolean
  error?: string
  helpText?: string
  disabled?: boolean
}

export function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  error,
  helpText,
  disabled = false
}: FormSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
        {helpText && <span className="text-slate-500 font-normal"> ({helpText})</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
        } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
        disabled={disabled}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.icon ? `${option.icon} ${option.label}` : option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  )
}

// Shared checkbox component
interface FormCheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  helpText?: string
  disabled?: boolean
  icon?: string
}

export function FormCheckbox({
  label,
  checked,
  onChange,
  helpText,
  disabled = false,
  icon
}: FormCheckboxProps) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        disabled={disabled}
      />
      <span className="text-sm text-slate-700">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
        {helpText && <span className="text-slate-500"> ({helpText})</span>}
      </span>
    </label>
  )
}

// Shared tag input component
interface FormTagsProps {
  label: string
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  helpText?: string
  error?: string
  disabled?: boolean
}

export function FormTags({
  label,
  tags,
  onChange,
  placeholder,
  helpText,
  error,
  disabled = false
}: FormTagsProps) {
  const handleTagsChange = (tagsString: string) => {
    const newTags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    onChange(newTags)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
        {helpText && <span className="text-slate-500 font-normal"> ({helpText})</span>}
      </label>
      <input
        type="text"
        value={tags.join(', ')}
        onChange={(e) => handleTagsChange(e.target.value)}
        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
        } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
        placeholder={placeholder}
        disabled={disabled}
      />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  )
}

// Shared loading button component
interface LoadingButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingButton({
  onClick,
  disabled = false,
  loading = false,
  children,
  variant = 'primary',
  size = 'md'
}: LoadingButtonProps) {
  const baseClasses = 'rounded-lg font-medium transition-colors flex items-center gap-2 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300',
    secondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:bg-slate-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-slate-300'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {loading && (
        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
      )}
      {children}
    </button>
  )
}

// Shared error alert component
interface ErrorAlertProps {
  error: string
  onDismiss?: () => void
}

export function ErrorAlert({ error, onDismiss }: ErrorAlertProps) {
  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start justify-between">
      <div className="flex items-start gap-2">
        <span className="text-red-500">⚠️</span>
        <span>{error}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 ml-2"
          aria-label="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  )
}

// Shared success alert component
interface SuccessAlertProps {
  message: string
  onDismiss?: () => void
}

export function SuccessAlert({ message, onDismiss }: SuccessAlertProps) {
  return (
    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start justify-between">
      <div className="flex items-start gap-2">
        <span className="text-green-500">✅</span>
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-green-400 hover:text-green-600 ml-2"
          aria-label="Dismiss message"
        >
          ✕
        </button>
      )}
    </div>
  )
}

// Shared confirmation dialog
interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'primary'
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'primary'
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-medium text-slate-800 mb-3">{title}</h3>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <LoadingButton onClick={onCancel} variant="secondary">
            {cancelText}
          </LoadingButton>
          <LoadingButton onClick={onConfirm} variant={variant}>
            {confirmText}
          </LoadingButton>
        </div>
      </div>
    </div>
  )
}

// Auto-save hook for draft functionality
export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  delay: number = 2000,
  enabled: boolean = true
) {
  const [lastSaved, setLastSaved] = React.useState<T>(data)
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (!enabled || JSON.stringify(data) === JSON.stringify(lastSaved)) {
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsSaving(true)
      try {
        await saveFunction(data)
        setLastSaved(data)
      } catch (error) {
        console.error('Auto-save failed:', error)
      } finally {
        setIsSaving(false)
      }
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [data, lastSaved, saveFunction, delay, enabled])

  return { isSaving, lastSaved }
}