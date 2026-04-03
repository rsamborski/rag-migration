'use client';

import { SearchBar } from '../components/SearchBar';
import { SearchResultList } from '../components/SearchResultList';
import ModelSwitcher from '../components/ModelSwitcher';
import { useSearch } from '../hooks/useSearch';

export default function Home() {
  const { query, setQuery, model, setModel, results, isLoading, error, performSearch } = useSearch();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <header className="text-center flex flex-col items-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Semantic Search
          </h1>
          <p className="mt-4 text-lg text-gray-600 mb-6">
            Search our product catalog using natural language.
          </p>
          <ModelSwitcher activeModel={model} onModelChange={setModel} />
        </header>

        <main className="flex flex-col gap-8">
          <section className="flex justify-center">
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              onSearch={performSearch}
              isLoading={isLoading}
            />
          </section>

          {isLoading && (
            <div className="flex justify-center py-12">
              <svg
                className="h-10 w-10 animate-spin text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}

          {error && !isLoading && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="text-sm text-red-700">
                {error}
              </div>
            </div>
          )}

          {!isLoading && (
            <section>
              <SearchResultList results={results} />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
