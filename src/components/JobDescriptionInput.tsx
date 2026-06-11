'use client';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
  resumeExists: boolean;
}

export default function JobDescriptionInput({
  value,
  onChange,
  isLoading,
  resumeExists,
}: JobDescriptionInputProps) {
  const isDisabled = !resumeExists || isLoading;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-gray-500">
          (03) Target Pattern
        </span>
        <span className="text-xs text-gray-400">{value.length} chars</span>
      </div>

      {/* Textarea */}
      <div className="px-4 pb-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDisabled}
          aria-label="Job description"
          aria-busy={isLoading}
          className={`w-full min-h-[180px] p-2 border border-gray-200 rounded text-sm resize-y focus:outline-none focus:border-gray-400 ${
            isDisabled
              ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-900'
          }`}
          placeholder={resumeExists ? 'Paste the full job description here...' : 'Upload a resume first'}
        />
      </div>
    </div>
  );
}
