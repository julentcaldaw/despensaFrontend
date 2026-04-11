import { useEffect, useMemo, useRef, useState } from 'react'

export interface SearchableSelectOption<TValue extends string | number = string> {
  value: TValue
  label: string
}

interface SearchableSelectProps<TValue extends string | number = string> {
  id: string
  label: string
  query: string
  options: SearchableSelectOption<TValue>[]
  onQueryChange: (value: string) => void
  onSelect: (option: SearchableSelectOption<TValue>) => void
  placeholder?: string
  error?: string
  helperText?: string
  helperTextIsError?: boolean
  isLoading?: boolean
  loadingText?: string
  emptyText?: string
  minQueryLength?: number
  disabled?: boolean
  required?: boolean
}

export function SearchableSelect<TValue extends string | number = string>({
  id,
  label,
  query,
  options,
  onQueryChange,
  onSelect,
  placeholder = 'Buscar...',
  error,
  helperText,
  helperTextIsError,
  isLoading,
  loadingText = 'Buscando...',
  emptyText = 'No hay resultados',
  minQueryLength = 2,
  disabled,
  required,
}: SearchableSelectProps<TValue>) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const normalizedQuery = query.trim()
  const shouldShowResults = normalizedQuery.length >= minQueryLength

  const hintText = useMemo(() => {
    if (helperText) return helperText
    if (!shouldShowResults && normalizedQuery.length > 0) {
      return `Escribe al menos ${minQueryLength} caracteres`
    }
    if (shouldShowResults && options.length === 0 && !isLoading) {
      return emptyText
    }
    return undefined
  }, [helperText, shouldShowResults, normalizedQuery.length, minQueryLength, options.length, emptyText, isLoading])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  function selectOption(option: SearchableSelectOption<TValue>) {
    onSelect(option)
    setIsOpen(false)
    setActiveIndex(-1)
  }

  return (
    <div ref={rootRef} className="w-full space-y-2">
      <label className="label px-0 pb-0" htmlFor={id}>
        <span className="label-text font-medium text-base-content">{label}</span>
      </label>

      <div className={`dropdown w-full ${isOpen ? 'dropdown-open' : ''}`}>
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
          aria-invalid={Boolean(error)}
          required={required}
          disabled={disabled}
          className={`input input-bordered w-full ${error ? 'input-error' : ''}`.trim()}
          placeholder={placeholder}
          value={query}
          autoComplete="off"
          onFocus={() => {
            setIsOpen(true)
            if (shouldShowResults && options.length > 0) {
              setActiveIndex(0)
            }
          }}
          onChange={(event) => {
            onQueryChange(event.target.value)
            setIsOpen(true)
            setActiveIndex(-1)
          }}
          onKeyDown={(event) => {
            if (!isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
              setIsOpen(true)
              return
            }

            if (!shouldShowResults || options.length === 0) {
              return
            }

            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setActiveIndex((prev) => (prev + 1) % options.length)
              return
            }

            if (event.key === 'ArrowUp') {
              event.preventDefault()
              setActiveIndex((prev) => (prev <= 0 ? options.length - 1 : prev - 1))
              return
            }

            if (event.key === 'Enter' && activeIndex >= 0) {
              event.preventDefault()
              selectOption(options[activeIndex])
              return
            }

            if (event.key === 'Escape') {
              event.preventDefault()
              setIsOpen(false)
              setActiveIndex(-1)
            }
          }}
        />

        {isOpen ? (
          <ul
            id={`${id}-listbox`}
            role="listbox"
            className="menu dropdown-content z-[70] mt-1 max-h-64 w-full overflow-auto rounded-box border border-base-300 bg-base-100 p-2 shadow"
          >
            {!shouldShowResults ? (
              <li className="menu-disabled">
                <span>{`Escribe al menos ${minQueryLength} caracteres`}</span>
              </li>
            ) : isLoading ? (
              <li className="menu-disabled">
                <span>{loadingText}</span>
              </li>
            ) : options.length === 0 ? (
              <li className="menu-disabled">
                <span>{emptyText}</span>
              </li>
            ) : (
              options.map((option, index) => (
                <li key={String(option.value)}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    className={index === activeIndex ? 'active' : ''}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectOption(option)}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>

      {error ? (
        <p className="label px-0 pt-0 text-sm text-error" role="alert">
          {error}
        </p>
      ) : hintText ? (
        <p
          className={`label px-0 pt-0 text-xs ${helperTextIsError ? 'text-error' : 'text-base-content/70'}`}
        >
          {hintText}
        </p>
      ) : null}
    </div>
  )
}
