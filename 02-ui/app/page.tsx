'use client';

import { SearchBar } from '../components/SearchBar';
import { SearchResultList } from '../components/SearchResultList';
import { useSearch } from '../hooks/useSearch';

export default function Home() {
  const { query, setQuery, results, isLoading, error, performSearch } = useSearch();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Semantic Search
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Search our product catalog using natural language.
          </p>
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

          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="text-sm text-red-700">
                {error}
              </div>
            </div>
          )}

          <section>
            <SearchResultList results={results} />
          </section>
        </main>
      </div>
    </div>
  );
}
