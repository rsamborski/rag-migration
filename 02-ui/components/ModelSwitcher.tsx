import React from 'react';

export type ModelType = 'default' | 'gemini';

interface ModelSwitcherProps {
  activeModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

export default function ModelSwitcher({ activeModel, onModelChange }: ModelSwitcherProps) {
  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <span className="font-medium text-gray-700">Search Model:</span>
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="radio"
          className="form-radio text-blue-600 focus:ring-blue-500 h-4 w-4"
          name="model-select"
          value="default"
          checked={activeModel === 'default'}
          onChange={() => onModelChange('default')}
        />
        <span className="ml-2 text-gray-700 text-sm">Original Model</span>
      </label>
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="radio"
          className="form-radio text-blue-600 focus:ring-blue-500 h-4 w-4"
          name="model-select"
          value="gemini"
          checked={activeModel === 'gemini'}
          onChange={() => onModelChange('gemini')}
        />
        <span className="ml-2 text-gray-700 text-sm">Gemini Multilingual</span>
      </label>
    </div>
  );
}
