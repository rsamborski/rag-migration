import React from 'react';
import { SearchResult } from '../hooks/useSearch';

interface SearchResultListProps {
  results: SearchResult[];
}

export function SearchResultList({ results }: SearchResultListProps) {
  if (results.length === 0) {
    return (
      <div className="flex w-full justify-center py-12 text-gray-500">
        No results found. Try a different query.
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {results.map((result) => (
        <div
          key={result.id}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-900">{result.name}</h3>
          <div className="mt-2 flex gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium text-gray-500 uppercase tracking-wide text-xs mr-1">Category:</span>
              {result.category}
            </div>
            <div>
              <span className="font-medium text-gray-500 uppercase tracking-wide text-xs mr-1">Brand:</span>
              {result.brand}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
