"use client";

import { useState, useEffect } from "react";
import { InsightsResult, AdaptedResume } from "@/contracts/adapt.contract";

interface ResultsPanelProps {
  insightsResult: InsightsResult | null;
  resumeResult: AdaptedResume | null;
  isLoadingInsights: boolean;
  isLoadingResume: boolean;
  insightsError: string | null;
  resumeError: string | null;
  onRetry?: () => void;
}

type TabType = "strengths" | "gaps" | "transferable" | "export";

const INSIGHTS_MESSAGES = [
  "Reading your work history...",
  "Identifying core competencies...",
  "Mapping skills to the role...",
  "Evaluating experience gaps...",
  "Generating talking points...",
  "Preparing interview insights...",
  "Cross-referencing with job requirements...",
  "Finalizing analysis...",
];

const RESUME_MESSAGES = [
  "Formatting Perficient template...",
  "Mapping your experience entries...",
  "Structuring key engagements...",
  "Applying corporate style...",
  "Polishing the final document...",
];

const SKELETON_CARDS = [
  { title: 60, lines: [90, 75] },
  { title: 45, lines: [100, 85, 70] },
  { title: 70, lines: [80, 60] },
  { title: 55, lines: [95, 80, 65] },
];

const MESSAGE_INTERVAL = 3200;

export default function ResultsPanel({
  insightsResult,
  resumeResult,
  isLoadingInsights,
  isLoadingResume,
  insightsError,
  onRetry,
}: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("strengths");
  const [insightsMsgIdx, setInsightsMsgIdx] = useState(0);
  const [resumeMsgIdx, setResumeMsgIdx] = useState(0);

  useEffect(() => {
    if (!isLoadingInsights) {
      setInsightsMsgIdx(0);
      return;
    }
    const id = setInterval(
      () => setInsightsMsgIdx((i) => i + 1),
      MESSAGE_INTERVAL,
    );
    return () => clearInterval(id);
  }, [isLoadingInsights]);

  useEffect(() => {
    if (!isLoadingResume) {
      setResumeMsgIdx(0);
      return;
    }
    const id = setInterval(
      () => setResumeMsgIdx((i) => i + 1),
      MESSAGE_INTERVAL,
    );
    return () => clearInterval(id);
  }, [isLoadingResume]);

  const handleDownload = () => {
    window.location.href = "/api/export";
  };

  const handleKeyDown = (e: React.KeyboardEvent, tab: TabType) => {
    const tabs: TabType[] = ["strengths", "gaps", "transferable", "export"];
    const currentIndex = tabs.indexOf(activeTab);

    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActiveTab(tabs[(currentIndex + 1) % tabs.length]);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveTab(tabs[(currentIndex - 1 + tabs.length) % tabs.length]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveTab(tab);
    }
  };

  const isInsightsTab =
    activeTab === "strengths" ||
    activeTab === "gaps" ||
    activeTab === "transferable";
  const hasAnyActivity =
    isLoadingInsights ||
    isLoadingResume ||
    insightsResult !== null ||
    resumeResult !== null;

  const tabClass = (tab: TabType) => {
    const isExport = tab === "export";
    const isDisabled = isExport && !resumeResult;
    return `px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
      activeTab === tab
        ? "border-gray-800 bg-gray-800 text-white"
        : isDisabled
          ? "border-gray-200 text-gray-300 cursor-not-allowed"
          : "border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-700"
    }`;
  };

  const ActivityHeader = ({
    msgIdx,
    messages,
  }: {
    msgIdx: number;
    messages: string[];
  }) => (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-xs text-gray-500 font-medium transition-all duration-300">
        {messages[msgIdx % messages.length]}
      </span>
      <span className="flex gap-0.5 shrink-0">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1 h-1 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </span>
    </div>
  );

  const SkeletonCards = () => (
    <div className="space-y-3">
      {SKELETON_CARDS.map((card, i) => (
        <div
          key={i}
          className="p-4 border border-gray-100 rounded bg-white space-y-2.5"
          style={{ animationDelay: `${i * 150}ms` }}
        >
          <div
            className="h-3 bg-gray-200 rounded animate-pulse"
            style={{ width: `${card.title}%`, animationDelay: `${i * 150}ms` }}
          />
          {card.lines.map((w, j) => (
            <div
              key={j}
              className="h-2.5 bg-gray-100 rounded animate-pulse"
              style={{
                width: `${w}%`,
                animationDelay: `${i * 150 + j * 80}ms`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 px-3 sm:px-5 pt-4 pb-3 border-b border-gray-200 bg-[#f5f4f0]">
        {(["strengths", "gaps", "transferable", "export"] as TabType[]).map(
          (tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              disabled={tab === "export" && !resumeResult}
              onClick={() => {
                if (tab === "export" && !resumeResult) return;
                setActiveTab(tab);
              }}
              onKeyDown={(e) => handleKeyDown(e, tab)}
              className={tabClass(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "export" && isLoadingResume && (
                <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              )}
            </button>
          ),
        )}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto px-3 md:px-5 py-4">
        {!hasAnyActivity ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[240px] sm:min-h-[360px] text-center">
            <svg
              className="w-10 h-10 text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 3L21 12L12 21L3 12L12 3Z"
              />
            </svg>
            <p className="font-semibold text-gray-700 mb-2">
              Results will appear here
            </p>
            <p className="text-sm text-gray-400 max-w-xs">
              Upload your resume, add any context, and paste a job description.
              We'll measure the fit and export a tailored DOCX.
            </p>
          </div>
        ) : (
          <>
            {/* Insights tabs */}
            {isInsightsTab && (
              <>
                {insightsError ? (
                  <div className="p-4 border border-red-200 rounded bg-red-50">
                    <p className="text-sm text-red-800 mb-3">{insightsError}</p>
                    {onRetry && (
                      <button
                        onClick={onRetry}
                        className="text-xs px-3 py-1.5 border border-red-400 text-red-700 rounded hover:bg-red-100"
                      >
                        Try again
                      </button>
                    )}
                  </div>
                ) : isLoadingInsights ? (
                  <>
                    <ActivityHeader
                      msgIdx={insightsMsgIdx}
                      messages={INSIGHTS_MESSAGES}
                    />
                    <SkeletonCards />
                  </>
                ) : insightsResult ? (
                  <>
                    {activeTab === "strengths" && (
                      <div role="tabpanel" className="space-y-3">
                        {insightsResult.strengths.map((strength, index) => (
                          <div
                            key={index}
                            className="p-3 sm:p-4 border border-gray-200 rounded bg-white"
                          >
                            <h3 className="font-semibold text-sm mb-2">
                              {strength.area}
                            </h3>
                            <p className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Evidence:</span>{" "}
                              {strength.evidence}
                            </p>
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">
                                Talking Point:
                              </span>{" "}
                              {strength.talking_point}
                            </p>
                          </div>
                        ))}
                        {insightsResult.strengths.length === 0 && (
                          <p className="text-sm text-gray-400 text-center py-8">
                            No strengths identified
                          </p>
                        )}
                      </div>
                    )}

                    {activeTab === "gaps" && (
                      <div role="tabpanel" className="space-y-3">
                        {insightsResult.gaps.map((gap, index) => (
                          <div
                            key={index}
                            className="p-3 sm:p-4 border border-gray-200 rounded bg-white"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-1 mb-2">
                              <h3 className="font-semibold text-sm">
                                {gap.skill}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  gap.severity === "critical"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {gap.severity === "critical"
                                  ? "Critical"
                                  : "Nice-to-have"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Mitigation:</span>{" "}
                              {gap.mitigation}
                            </p>
                          </div>
                        ))}
                        {insightsResult.gaps.length === 0 && (
                          <p className="text-sm text-gray-400 text-center py-8">
                            No gaps identified
                          </p>
                        )}
                      </div>
                    )}

                    {activeTab === "transferable" && (
                      <div role="tabpanel" className="space-y-3">
                        {insightsResult.transferable_skills.map(
                          (skill, index) => (
                            <div
                              key={index}
                              className="p-3 sm:p-4 border border-gray-200 rounded bg-white"
                            >
                              <h3 className="font-semibold text-sm mb-2">
                                {skill.skill}
                              </h3>
                              <p className="text-xs text-gray-600 mb-1">
                                <span className="font-medium">Source:</span>{" "}
                                {skill.source_experience}
                              </p>
                              <p className="text-xs text-gray-600 mb-1">
                                <span className="font-medium">Relevance:</span>{" "}
                                {skill.relevance_to_role}
                              </p>
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Bridge:</span>{" "}
                                {skill.bridge_statement}
                              </p>
                            </div>
                          ),
                        )}
                        {insightsResult.transferable_skills.length === 0 && (
                          <p className="text-sm text-gray-400 text-center py-8">
                            No transferable skills identified
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : null}
              </>
            )}

            {/* Export tab */}
            {activeTab === "export" && (
              <div
                role="tabpanel"
                className="flex flex-col items-center justify-center min-h-[200px] gap-4"
              >
                {resumeResult ? (
                  <>
                    <p className="text-sm text-gray-600">
                      Your tailored resume is ready to download.
                    </p>
                    <button
                      onClick={handleDownload}
                      className="px-5 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
                    >
                      Download DOCX
                    </button>
                  </>
                ) : (
                  <ActivityHeader
                    msgIdx={resumeMsgIdx}
                    messages={RESUME_MESSAGES}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom download bar */}
      <div className="border-t border-gray-200 px-3 md:px-5 py-3 flex items-center gap-2 sm:gap-3 bg-[#f5f4f0]">
        <span className="text-xs font-semibold border border-gray-300 rounded px-1.5 py-0.5 text-gray-500 tracking-widest">
          DOCX
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-700">
            Tailored DOCX export
          </p>
          <p className="text-xs text-gray-400">
            {isLoadingResume
              ? RESUME_MESSAGES[resumeMsgIdx % RESUME_MESSAGES.length]
              : resumeResult
                ? "Ready to download"
                : "Adapt your resume to enable export"}
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={!resumeResult}
          className={`text-xs px-4 py-1.5 rounded font-medium transition-colors ${
            resumeResult
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isLoadingResume ? (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
              Generating...
            </span>
          ) : (
            "Download"
          )}
        </button>
      </div>
    </div>
  );
}
