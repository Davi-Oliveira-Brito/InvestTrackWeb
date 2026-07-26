"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { buscarAtivos } from "@/services/ativo-service"
import type { AtivoSugestao } from "@/types/ativo"

const DEBOUNCE_MS = 300

interface TickerAutocompleteProps {
  id?: string
  value: string
  onValueChange: (value: string) => void
  onSelect: (ativo: AtivoSugestao) => void
  token: string
  ariaInvalid?: boolean
}

export function TickerAutocomplete({
  id,
  value,
  onValueChange,
  onSelect,
  token,
  ariaInvalid,
}: TickerAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestQueryRef = useRef("")

  const [suggestions, setSuggestions] = useState<AtivoSugestao[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const query = value.trim()
    latestQueryRef.current = query

    if (query.length === 0) {
      setSuggestions([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    debounceRef.current = setTimeout(async () => {
      const result = await buscarAtivos(query, token)
      if (latestQueryRef.current !== query) return

      setIsLoading(false)
      if (result.ok) {
        setSuggestions(result.data)
        setHighlightedIndex(-1)
      }
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value, token])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelect(ativo: AtivoSugestao) {
    onSelect(ativo)
    setIsOpen(false)
    setSuggestions([])
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setHighlightedIndex((index) => Math.min(index + 1, suggestions.length - 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setHighlightedIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === "Enter") {
      if (highlightedIndex >= 0) {
        event.preventDefault()
        handleSelect(suggestions[highlightedIndex])
      }
    } else if (event.key === "Escape") {
      setIsOpen(false)
    }
  }

  const showPanel = isOpen && (isLoading || suggestions.length > 0 || value.trim().length > 0)

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        autoComplete="off"
        value={value}
        onChange={(event) => {
          onValueChange(event.target.value)
          setIsOpen(true)
        }}
        onFocus={() => {
          if (value.trim().length > 0) setIsOpen(true)
        }}
        onKeyDown={handleKeyDown}
        aria-invalid={ariaInvalid}
      />

      {showPanel && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10">
          {isLoading && (
            <p className="px-3 py-2 text-sm text-mute">Buscando...</p>
          )}

          {!isLoading && suggestions.length === 0 && (
            <p className="px-3 py-2 text-sm text-mute">Nenhum ativo encontrado.</p>
          )}

          {!isLoading &&
            suggestions.map((ativo, index) => (
              <button
                key={ativo.ticker}
                type="button"
                className={cn(
                  "flex w-full cursor-pointer flex-col items-start gap-0.5 px-3 py-2 text-left text-sm",
                  index === highlightedIndex ? "bg-canvas-soft" : "hover:bg-canvas-soft"
                )}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => handleSelect(ativo)}
              >
                <span className="font-semibold text-ink">{ativo.ticker}</span>
                <span className="text-mute">{ativo.nome}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
