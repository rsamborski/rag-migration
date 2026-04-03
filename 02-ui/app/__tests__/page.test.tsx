/** @jest-environment jsdom */
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../page';
import { useSearch } from '../../hooks/useSearch';
import '@testing-library/jest-dom';

// Mock the useSearch hook
jest.mock('../../hooks/useSearch');

describe('Home Page', () => {
  const mockUseSearch = useSearch as jest.Mock;

  beforeEach(() => {
    mockUseSearch.mockReturnValue({
      query: '',
      setQuery: jest.fn(),
      model: 'default',
      setModel: jest.fn(),
      results: [],
      isLoading: false,
      error: null,
      performSearch: jest.fn(),
    });
  });

  it('should render the title and search bar', () => {
    render(<Home />);
    
    expect(screen.getByText(/semantic search/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search for products/i)).toBeInTheDocument();
  });

  it('should render results when they are present', () => {
    mockUseSearch.mockReturnValue({
      query: 'test',
      setQuery: jest.fn(),
      model: 'default',
      setModel: jest.fn(),
      results: [
        { id: '1', name: 'Product A', category: 'Cat 1', brand: 'Brand X' }
      ],
      isLoading: false,
      error: null,
      performSearch: jest.fn(),
    });

    render(<Home />);
    
    expect(screen.getByText('Product A')).toBeInTheDocument();
  });

  it('should show error message when there is an error', () => {
    mockUseSearch.mockReturnValue({
      query: 'test',
      setQuery: jest.fn(),
      model: 'default',
      setModel: jest.fn(),
      results: [],
      isLoading: false,
      error: 'Something went wrong',
      performSearch: jest.fn(),
    });

    render(<Home />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render ModelSwitcher and call setModel on toggle', () => {
    const mockSetModel = jest.fn();
    mockUseSearch.mockReturnValue({
      query: '',
      setQuery: jest.fn(),
      model: 'default',
      setModel: mockSetModel,
      results: [],
      isLoading: false,
      error: null,
      performSearch: jest.fn(),
    });

    render(<Home />);
    
    expect(screen.getByText('Search Model:')).toBeInTheDocument();
    
    const geminiRadio = screen.getByLabelText('Gemini Multilingual');
    fireEvent.click(geminiRadio);

    expect(mockSetModel).toHaveBeenCalledWith('gemini');
  });
});
