'use client';

import { useState } from 'react';
import { AdaptationResult } from '@/contracts/adapt.contract';

interface ResultsPanelProps {
  adaptationResult: AdaptationResult | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

type TabType = 'strengths' | 'gaps' | 'transferable' | 'export';

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
    const tabs: TabType[] = ['strengths', 'gaps', 'transferable', 'export'];
    const currentIndex = tabs.indexOf(activeTab);

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveTab(tabs[(currentIndex + 1) % tabs.length]);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveTab(tabs[(currentIndex - 1 + tabs.length) % tabs.length]);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tab);
    }
  };

  const tabClass = (tab: TabType) =>
    `px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
      activeTab === tab
        ? 'border-gray-800 bg-gray-800 text-white'
        : 'border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-700'
    }`;

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-gray-200 bg-[#f5f4f0]">
        {(['strengths', 'gaps', 'transferable', 'export'] as TabType[]).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            onKeyDown={(e) => handleKeyDown(e, tab)}
            className={tabClass(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {error ? (
          <div className="p-4 border border-red-200 rounded bg-red-50">
            <p className="text-sm text-red-800 mb-3">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-xs px-3 py-1.5 border border-red-400 text-red-700 rounded hover:bg-red-100"
              >
                Try again
              </button>
            )}
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : !adaptationResult ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[360px] text-center">
            <svg className="w-10 h-10 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 3L21 12L12 21L3 12L12 3Z" />
            </svg>
            <p className="font-semibold text-gray-700 mb-2">Results will appear here</p>
            <p className="text-sm text-gray-400 max-w-xs">
              Upload your resume, add any context, and paste a job description. We'll measure the fit and export a tailored DOCX.
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'strengths' && (
              <div role="tabpanel" className="space-y-3">
                {adaptationResult.strengths.map((strength, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded bg-white">
                    <h3 className="font-semibold text-sm mb-2">{strength.area}</h3>
                    <p className="text-xs text-gray-600 mb-1">
                      <span className="font-medium">Evidence:</span> {strength.evidence}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Talking Point:</span> {strength.talking_point}
                    </p>
                  </div>
                ))}
                {adaptationResult.strengths.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No strengths identified</p>
                )}
              </div>
            )}

            {activeTab === 'gaps' && (
              <div role="tabpanel" className="space-y-3">
                {adaptationResult.gaps.map((gap, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">{gap.skill}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        gap.severity === 'critical'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {gap.severity === 'critical' ? 'Critical' : 'Nice-to-have'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Mitigation:</span> {gap.mitigation}
                    </p>
                  </div>
                ))}
                {adaptationResult.gaps.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No gaps identified</p>
                )}
              </div>
            )}

            {activeTab === 'transferable' && (
              <div role="tabpanel" className="space-y-3">
                {adaptationResult.transferable_skills.map((skill, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded bg-white">
                    <h3 className="font-semibold text-sm mb-2">{skill.skill}</h3>
                    <p className="text-xs text-gray-600 mb-1">
                      <span className="font-medium">Source:</span> {skill.source_experience}
                    </p>
                    <p className="text-xs text-gray-600 mb-1">
                      <span className="font-medium">Relevance:</span> {skill.relevance_to_role}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Bridge:</span> {skill.bridge_statement}
                    </p>
                  </div>
                ))}
                {adaptationResult.transferable_skills.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No transferable skills identified</p>
                )}
              </div>
            )}

            {activeTab === 'export' && (
              <div role="tabpanel" className="flex flex-col items-center justify-center min-h-[200px] gap-4">
                <p className="text-sm text-gray-600">Your tailored resume is ready to download.</p>
                <button
                  onClick={handleDownload}
                  className="px-5 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
                >
                  Download DOCX
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom download bar */}
      <div className="border-t border-gray-200 px-5 py-3 flex items-center gap-3 bg-[#f5f4f0]">
        <span className="text-xs font-semibold border border-gray-300 rounded px-1.5 py-0.5 text-gray-500 tracking-widest">
          DOCX
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-700">Tailored DOCX export</p>
          <p className="text-xs text-gray-400">Adapt your resume to enable export</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={!adaptationResult}
          className={`text-xs px-4 py-1.5 rounded font-medium transition-colors ${
            adaptationResult
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Download
        </button>
      </div>
    </div>
  );
}
