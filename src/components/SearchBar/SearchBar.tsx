'use client'

import { type ChangeEvent, useState, useCallback, useEffect, useRef } from 'react'
import debounce from 'lodash/debounce'

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading?: boolean
}

export function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const debouncedFn = useRef(debounce((q: string) => onSearch(q), 300))

  // Update debounced function when onSearch changes
  useEffect(() => {
    debouncedFn.current = debounce((q: string) => onSearch(q), 300)
  }, [onSearch])

  // Cleanup on unmount
  useEffect(() => () => debouncedFn.current.cancel(), [])

  const debouncedSearch = useCallback((searchQuery: string) =>
    debouncedFn.current(searchQuery), [])

  const handleClear = () => {
    setQuery('')
    onSearch('') // Clear search results when input is cleared
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search for songs..."
        aria-label="Search songs"
        className="w-full px-4 py-2 text-gray-800 border rounded-lg focus:outline-none focus:border-blue-500"
        disabled={isLoading}
      />
      {query && !isLoading && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
          aria-label="Clear search"
        >×</button>
      )}
      {isLoading && (
        <div className="absolute right-3 top-2.5">
          <div className="w-5 h-5 border-2 border-blue-500 rounded-full animate-spin border-t-transparent" role="status" aria-label="Loading..." />
        </div>
      )}
    </div>
  )
}
