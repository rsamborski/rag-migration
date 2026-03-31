import React from 'react';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

export function SearchBar({ query, onQueryChange, onSearch, isLoading = false }: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="flex w-full max-w-2xl gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search for products..."
        className="flex-grow rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
        disabled={isLoading}
      />
      <button
        onClick={onSearch}
        disabled={isLoading || !query.trim()}
        className="rounded-md bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
}
