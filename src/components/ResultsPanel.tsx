'use client';

import { useState } from 'react';
import { AdaptationResult } from '@/contracts/adapt.contract';

interface ResultsPanelProps {
  adaptationResult: AdaptationResult | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

type TabType = 'strengths' | 'gaps' | 'transferable';

export default function ResultsPanel({
  adaptationResult,
  isLoading,
  error,
  onRetry,
}: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('strengths');

  const handleDownload = () => {
    window.location.href = '/api/export';
  };

  const handleKeyDown = (e: React.KeyboardEvent, tab: TabType) => {
    const tabs: TabType[] = ['strengths', 'gaps', 'transferable'];
    const currentIndex = tabs.indexOf(activeTab);

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabs.length;
      setActiveTab(tabs[nextIndex]);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[prevIndex]);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tab);
    }
  };

  if (error) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-800 mb-3">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!adaptationResult) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-400">Adapt a resume to see results</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div role="tablist" className="flex gap-2">
          <button
            role="tab"
            aria-selected={activeTab === 'strengths'}
            aria-controls="strengths-panel"
            id="strengths-tab"
            onClick={() => setActiveTab('strengths')}
            onKeyDown={(e) => handleKeyDown(e, 'strengths')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'strengths'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Strengths
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'gaps'}
            aria-controls="gaps-panel"
            id="gaps-tab"
            onClick={() => setActiveTab('gaps')}
            onKeyDown={(e) => handleKeyDown(e, 'gaps')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'gaps'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Gaps
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'transferable'}
            aria-controls="transferable-panel"
            id="transferable-tab"
            onClick={() => setActiveTab('transferable')}
            onKeyDown={(e) => handleKeyDown(e, 'transferable')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'transferable'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Transferable
          </button>
        </div>

        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          Download DOCX
        </button>
      </div>

      {activeTab === 'strengths' && (
        <div
          role="tabpanel"
          id="strengths-panel"
          aria-labelledby="strengths-tab"
          className="space-y-3"
        >
          {adaptationResult.strengths.map((strength, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg bg-white"
            >
              <h3 className="font-semibold text-lg mb-2">{strength.area}</h3>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">Evidence:</span> {strength.evidence}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Talking Point:</span>{' '}
                {strength.talking_point}
              </p>
            </div>
          ))}
          {adaptationResult.strengths.length === 0 && (
            <p className="text-gray-500 text-center py-8">No strengths identified</p>
          )}
        </div>
      )}

      {activeTab === 'gaps' && (
        <div
          role="tabpanel"
          id="gaps-panel"
          aria-labelledby="gaps-tab"
          className="space-y-3"
        >
          {adaptationResult.gaps.map((gap, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{gap.skill}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    gap.severity === 'critical'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {gap.severity === 'critical' ? 'Critical' : 'Nice-to-have'}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Mitigation:</span> {gap.mitigation}
              </p>
            </div>
          ))}
          {adaptationResult.gaps.length === 0 && (
            <p className="text-gray-500 text-center py-8">No gaps identified</p>
          )}
        </div>
      )}

      {activeTab === 'transferable' && (
        <div
          role="tabpanel"
          id="transferable-panel"
          aria-labelledby="transferable-tab"
          className="space-y-3"
        >
          {adaptationResult.transferable_skills.map((skill, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg bg-white"
            >
              <h3 className="font-semibold text-lg mb-2">{skill.skill}</h3>
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Source:</span>{' '}
                {skill.source_experience}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Relevance:</span>{' '}
                {skill.relevance_to_role}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Bridge Statement:</span>{' '}
                {skill.bridge_statement}
              </p>
            </div>
          ))}
          {adaptationResult.transferable_skills.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No transferable skills identified
            </p>
          )}
        </div>
      )}
    </div>
  );
}
