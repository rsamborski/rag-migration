/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { SearchResultList } from '../SearchResultList';
import { SearchResult } from '../../hooks/useSearch';
import '@testing-library/jest-dom';

describe('SearchResultList Component', () => {
  const mockResults: SearchResult[] = [
    { id: '1', name: 'Product A', category: 'Category 1', brand: 'Brand X' },
    { id: '2', name: 'Product B', category: 'Category 2', brand: 'Brand Y' },
  ];

  it('should render a list of results', () => {
    render(<SearchResultList results={mockResults} />);
    
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Category 1')).toBeInTheDocument();
    expect(screen.getByText('Brand X')).toBeInTheDocument();
    
    expect(screen.getByText('Product B')).toBeInTheDocument();
    expect(screen.getByText('Category 2')).toBeInTheDocument();
    expect(screen.getByText('Brand Y')).toBeInTheDocument();
  });

  it('should render a message when no results are found', () => {
    render(<SearchResultList results={[]} />);
    
    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
  });
});
