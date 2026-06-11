'use client';

import { useState, useEffect } from 'react';

interface ExplanationInputProps {
  onSaveSuccess: () => void;
  onSaveError: (error: string) => void;
  currentStatus: 'idle' | 'saved';
  initialContent?: string | null;
}

const MAX_LENGTH = 50000;

export default function ExplanationInput({
  onSaveSuccess,
  onSaveError,
  currentStatus,
  initialContent,
}: ExplanationInputProps) {
  const [content, setContent] = useState(initialContent || '');
  const [state, setState] = useState<'idle' | 'editing' | 'saving' | 'saved' | 'error'>(
    currentStatus === 'saved' ? 'saved' : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  useEffect(() => {
    if (currentStatus === 'saved' && state !== 'saved') {
      setState('saved');
    } else if (currentStatus === 'idle' && state === 'saved') {
      setState('idle');
    }
  }, [currentStatus, state]);

  const handleSave = async () => {
    if (!content.trim() || content.length > MAX_LENGTH) return;

    setState('saving');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data.error?.message || 'Failed to save explanation';
        setState('error');
        setErrorMessage(message);
        onSaveError(message);
        return;
      }

      setState('saved');
      onSaveSuccess();
    } catch {
      const message = 'Connection failed. Check your network.';
      setState('error');
      setErrorMessage(message);
      onSaveError(message);
    }
  };

  const handleEdit = () => {
    setState('editing');
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (state !== 'editing') {
      setState('editing');
    }
  };

  const canSave = content.trim().length > 0 && content.length <= MAX_LENGTH && state !== 'saving';

  return (
    <div className="w-full">
      <div className="relative">
        <textarea
          aria-label="Explanation"
          value={content}
          onChange={handleChange}
          disabled={state === 'saving'}
          readOnly={state === 'saved'}
          placeholder="Provide additional background about your experience, career goals, or context that will help optimize your resume..."
          className={`w-full min-h-[160px] p-3 border rounded-lg resize-y text-sm ${
            state === 'saving' || state === 'saved'
              ? 'bg-gray-50 text-gray-600'
              : 'bg-white text-gray-900'
          } ${errorMessage ? 'border-red-300' : 'border-gray-300'}`}
        />

        <div className="flex items-center justify-between mt-2">
          <span
            aria-live="polite"
            className={`text-xs ${content.length > MAX_LENGTH ? 'text-red-600' : 'text-gray-500'}`}
          >
            {content.length}/{MAX_LENGTH}
          </span>

          <div className="flex items-center gap-2">
            {state === 'saved' && (
              <span className="text-xs text-green-600">Saved</span>
            )}

            {state === 'saved' ? (
              <button
                onClick={handleEdit}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Edit
              </button>
            ) : state === 'error' ? (
              <button
                onClick={handleSave}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!canSave}
                aria-disabled={!canSave}
                className={`px-3 py-1.5 text-sm rounded ${
                  canSave
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {state === 'saving' ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </div>
      </div>

      {errorMessage && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
