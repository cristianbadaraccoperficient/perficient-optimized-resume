'use client';

import { useState, useRef } from 'react';

interface JobDescriptionInputProps {
  onAdapt: (jd: string) => void;
  isLoading: boolean;
  resumeExists: boolean;
  error: string | null;
}

export default function JobDescriptionInput({
  onAdapt,
  isLoading,
  resumeExists,
  error,
}: JobDescriptionInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = text.length;
  const isValid = charCount >= 50;
  const isDisabled = !resumeExists || isLoading;
  const isButtonEnabled = isValid && !isLoading && resumeExists;

  const handleSubmit = () => {
    if (isButtonEnabled) {
      onAdapt(text);
    }
  };

  const handleRetry = () => {
    if (text.length >= 50) {
      onAdapt(text);
    }
  };

  const getHelperText = () => {
    if (!resumeExists) {
      return 'Upload resume first';
    }
    return `Paste the full job description (minimum 50 characters) - ${charCount} characters`;
  };

  const getButtonText = () => {
    if (isLoading) {
      return (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </span>
      );
    }
    return 'Adapt Resume';
  };

  const getButtonAriaLabel = () => {
    if (!resumeExists) {
      return 'Upload resume first before adapting';
    }
    if (!isValid) {
      return 'Enter at least 50 characters to enable adaptation';
    }
    if (isLoading) {
      return 'Processing adaptation';
    }
    return 'Adapt resume to job description';
  };

  return (
    <div className="space-y-3">
      <div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isDisabled}
          aria-label="Job description"
          aria-describedby="jd-helper-text"
          aria-busy={isLoading}
          className={`w-full min-h-[200px] p-3 border rounded-lg resize-y ${
            isDisabled
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }`}
          placeholder={
            resumeExists
              ? 'Paste the full job description here...'
              : 'Upload a resume first'
          }
        />
        <p
          id="jd-helper-text"
          className={`text-sm mt-1 ${
            !resumeExists ? 'text-orange-600' : 'text-gray-600'
          }`}
        >
          {getHelperText()}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-sm text-red-800">{error}</p>
          {text.length >= 50 && (
            <button
              onClick={handleRetry}
              className="mt-2 text-sm text-red-700 underline hover:text-red-900"
            >
              Try again
            </button>
          )}
        </div>
      )}

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isLoading && 'Processing your request'}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isButtonEnabled}
        aria-disabled={!isButtonEnabled}
        aria-label={getButtonAriaLabel()}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          isButtonEnabled
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {getButtonText()}
      </button>
    </div>
  );
}
