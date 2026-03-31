/** @jest-environment jsdom */
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '../SearchBar';
import '@testing-library/jest-dom';

describe('SearchBar Component', () => {
  const defaultProps = {
    query: '',
    onQueryChange: jest.fn(),
    onSearch: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the search input and button', () => {
    render(<SearchBar {...defaultProps} />);
    
    expect(screen.getByPlaceholderText(/search for products/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('should call onQueryChange when typing', () => {
    render(<SearchBar {...defaultProps} />);
    
    const input = screen.getByPlaceholderText(/search for products/i);
    fireEvent.change(input, { target: { value: 'test query' } });
    
    expect(defaultProps.onQueryChange).toHaveBeenCalledWith('test query');
  });

  it('should call onSearch when button is clicked', () => {
    render(<SearchBar {...defaultProps} query="test" />);
    
    const button = screen.getByRole('button', { name: /search/i });
    fireEvent.click(button);
    
    expect(defaultProps.onSearch).toHaveBeenCalled();
  });

  it('should call onSearch when Enter key is pressed', () => {
    render(<SearchBar {...defaultProps} query="test" />);
    
    const input = screen.getByPlaceholderText(/search for products/i);
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(defaultProps.onSearch).toHaveBeenCalled();
  });

  it('should show loading state on button when isLoading is true', () => {
    render(<SearchBar {...defaultProps} isLoading={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/searching/i);
  });
});
