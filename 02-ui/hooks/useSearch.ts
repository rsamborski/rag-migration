import { useState } from 'react';
import { ModelType } from '../components/ModelSwitcher';

export interface SearchResult {
  id: string | number;
  name: string;
  category: string;
  brand: string;
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [model, setModel] = useState<ModelType>('default');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&model=${model}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
      } else {
        setError(data.error || 'An error occurred during search.');
        setResults([]);
      }
    } catch (err) {
      setError('An error occurred during search.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    query,
    setQuery,
    model,
    setModel,
    results,
    isLoading,
    error,
    performSearch,
  };
}
