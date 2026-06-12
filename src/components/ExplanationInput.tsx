'use client';

import { useState, useEffect } from 'react';

interface ExplanationInputProps {
  onSaveSuccess: () => void;
  onSaveError: (error: string) => void;
  currentStatus: 'idle' | 'saved';
  initialContent?: string | null;
  initialFormattedMd?: string | null;
}

const MAX_LENGTH = 50000;

export default function ExplanationInput({
  onSaveSuccess,
  onSaveError,
  currentStatus,
  initialContent,
  initialFormattedMd,
}: ExplanationInputProps) {
  const [content, setContent] = useState(initialContent || '');
  const [state, setState] = useState<'idle' | 'editing' | 'saving' | 'saved' | 'error'>(
    currentStatus === 'saved' ? 'saved' : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [formattedMd, setFormattedMd] = useState<string | null>(initialFormattedMd || null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (initialContent) setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    if (initialFormattedMd) setFormattedMd(initialFormattedMd);
  }, [initialFormattedMd]);

  useEffect(() => {
    if (currentStatus === 'saved') {
      setState('saved');
    } else if (currentStatus === 'idle') {
      setState('idle');
    }
  }, [currentStatus]);

  const handleSave = async () => {
    if (!content.trim() || content.length > MAX_LENGTH) return;

    setState('saving');
    setErrorMessage(null);
    setWarningMessage(null);

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

      if (data.data.formatted) {
        const getRes = await fetch('/api/explanation');
        const getData = await getRes.json();
        if (getData.formatted_md) {
          setFormattedMd(getData.formatted_md);
        }
      } else if (data.data.format_error) {
        setWarningMessage('Saved, but auto-formatting unavailable');
      }

      onSaveSuccess();
    } catch {
      const message = 'Connection failed. Check your network.';
      setState('error');
      setErrorMessage(message);
      onSaveError(message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (state !== 'editing') setState('editing');
    setFormattedMd(null);
    setShowPreview(false);
  };

  const canSave = content.trim().length > 0 && content.length <= MAX_LENGTH && state !== 'saving';

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-gray-500">
          (02) Strategic Context
        </span>
        <span className={`text-xs ${content.length > MAX_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
          {content.length} / {MAX_LENGTH.toLocaleString()}
        </span>
      </div>

      {/* Textarea / Preview */}
      <div className="px-4 pb-3">
        {showPreview && formattedMd ? (
          <div className="w-full min-h-[120px] p-2 border border-gray-200 rounded text-sm bg-gray-50 text-gray-700 overflow-y-auto max-h-[200px] sm:max-h-[300px] whitespace-pre-wrap">
            {formattedMd}
          </div>
        ) : (
          <textarea
            aria-label="Strategic context"
            value={content}
            onChange={handleChange}
            disabled={state === 'saving'}
            readOnly={state === 'saved'}
            placeholder="What makes you the right fit that isn't on your resume?"
            className={`w-full min-h-[120px] p-2 border border-gray-200 rounded text-sm resize-y focus:outline-none focus:border-gray-400 ${
              state === 'saving' || state === 'saved'
                ? 'bg-gray-50 text-gray-600'
                : 'bg-white text-gray-900'
            } ${errorMessage ? 'border-red-300' : ''}`}
          />
        )}
      </div>

      {/* Footer row */}
      <div className="flex flex-wrap items-center justify-end px-4 pb-3 gap-2 sm:gap-3">
        {warningMessage && (
          <span className="text-xs text-amber-500">{warningMessage}</span>
        )}
        {state === 'saved' && (
          <span className="text-xs text-gray-400">Saved</span>
        )}
        {errorMessage && (
          <span role="alert" className="text-xs text-red-500">{errorMessage}</span>
        )}
        {state === 'saved' && formattedMd && (
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-gray-500 hover:text-gray-800 underline"
          >
            {showPreview ? 'Raw' : 'Preview'}
          </button>
        )}
        {state === 'saved' ? (
          <button
            onClick={() => { setState('editing'); setShowPreview(false); }}
            className="text-xs text-gray-500 hover:text-gray-800 underline"
          >
            Edit
          </button>
        ) : state === 'error' ? (
          <button
            onClick={handleSave}
            className="text-xs text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`text-xs px-3 py-1 rounded border transition-colors ${
              canSave
                ? 'border-gray-400 text-gray-700 hover:bg-gray-100'
                : 'border-gray-200 text-gray-300 cursor-not-allowed'
            }`}
          >
            {state === 'saving' ? 'Processing...' : 'Save'}
          </button>
        )}
      </div>
    </div>
  );
}
