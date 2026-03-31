/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useSearch } from '../useSearch';

// Mock the global fetch API
global.fetch = jest.fn();

describe('useSearch Hook', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSearch());

    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set the query correctly', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('test query');
    });

    expect(result.current.query).toBe('test query');
  });

  it('should handle a successful search', async () => {
    const mockResults = [
      { id: 1, name: 'Product 1', category: 'Category A', brand: 'Brand X' }
    ];
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults }),
    });

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('test query');
    });

    await act(async () => {
      await result.current.performSearch();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/search?q=test%20query');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.results).toEqual(mockResults);
    expect(result.current.error).toBeNull();
  });

  it('should handle an empty query without making a request', async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.performSearch();
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
  });

  it('should handle an API error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    });

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('test query');
    });

    await act(async () => {
      await result.current.performSearch();
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBe('Internal Server Error');
  });

  it('should handle successful search with missing results in response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('test query');
    });

    await act(async () => {
      await result.current.performSearch();
    });

    expect(result.current.results).toEqual([]);
  });

  it('should handle API error with missing error message in response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('test query');
    });

    await act(async () => {
      await result.current.performSearch();
    });

    expect(result.current.error).toBe('An error occurred during search.');
  });

  it('should handle a network failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('test query');
    });

    await act(async () => {
      await result.current.performSearch();
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBe('An error occurred during search.');
  });
});
