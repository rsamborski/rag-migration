/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModelSwitcher from '../ModelSwitcher';

describe('ModelSwitcher', () => {
  it('renders correctly with default model', () => {
    const onModelChange = jest.fn();
    render(<ModelSwitcher activeModel="default" onModelChange={onModelChange} />);

    expect(screen.getByText('Original Model')).toBeInTheDocument();
    expect(screen.getByText('Gemini Multilingual')).toBeInTheDocument();
    
    const defaultRadio = screen.getByLabelText('Original Model') as HTMLInputElement;
    expect(defaultRadio.checked).toBe(true);
    
    const geminiRadio = screen.getByLabelText('Gemini Multilingual') as HTMLInputElement;
    expect(geminiRadio.checked).toBe(false);
  });

  it('renders correctly with gemini model active', () => {
    const onModelChange = jest.fn();
    render(<ModelSwitcher activeModel="gemini" onModelChange={onModelChange} />);

    const defaultRadio = screen.getByLabelText('Original Model') as HTMLInputElement;
    expect(defaultRadio.checked).toBe(false);
    
    const geminiRadio = screen.getByLabelText('Gemini Multilingual') as HTMLInputElement;
    expect(geminiRadio.checked).toBe(true);
  });

  it('calls onModelChange when a different model is selected', () => {
    const onModelChange = jest.fn();
    render(<ModelSwitcher activeModel="default" onModelChange={onModelChange} />);

    const geminiRadio = screen.getByLabelText('Gemini Multilingual');
    fireEvent.click(geminiRadio);

    expect(onModelChange).toHaveBeenCalledWith('gemini');
    expect(onModelChange).toHaveBeenCalledTimes(1);
  });
});
