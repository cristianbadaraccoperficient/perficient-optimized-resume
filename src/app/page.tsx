"use client";

import { useState, useEffect, useRef } from "react";
import ResumeUpload from "@/components/ResumeUpload";
import ExplanationInput from "@/components/ExplanationInput";
import JobDescriptionInput from "@/components/JobDescriptionInput";
import ResultsPanel from "@/components/ResultsPanel";
import { InsightsResult, AdaptedResume } from "@/contracts/adapt.contract";

interface ResumeData {
  filename: string;
  parsed_length: number;
  sections_detected: string[];
}

export default function Home() {
  const [resumeStatus, setResumeStatus] = useState<"idle" | "uploaded">("idle");
  const [resumeFilename, setResumeFilename] = useState<string | null>(null);
  const [resumeUploadedAt, setResumeUploadedAt] = useState<string | null>(null);
  const [explanationStatus, setExplanationStatus] = useState<"idle" | "saved">(
    "idle",
  );
  const [explanationContent, setExplanationContent] = useState<string | null>(
    null,
  );
  const [explanationFormattedMd, setExplanationFormattedMd] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [insightsResult, setInsightsResult] = useState<InsightsResult | null>(null);
  const [resumeResult, setResumeResult] = useState<AdaptedResume | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [progressMsg, setProgressMsg] = useState<string>("Processing...");

  useEffect(() => {
    async function loadExisting() {
      try {
        const [resumeRes, explanationRes] = await Promise.all([
          fetch("/api/resume"),
          fetch("/api/explanation"),
        ]);

        const resumeData = await resumeRes.json();
        if (resumeData.exists) {
          setResumeStatus("uploaded");
          setResumeFilename(resumeData.original_filename);
          setResumeUploadedAt(resumeData.uploaded_at);
        }

        const explanationData = await explanationRes.json();
        if (explanationData.exists) {
          setExplanationStatus("saved");
          setExplanationContent(explanationData.content);
          setExplanationFormattedMd(explanationData.formatted_md || null);
        }
      } catch {
        // Silent fail on initial load
      }
    }

    loadExisting();
  }, []);

  const isAdapting = isLoadingInsights || isLoadingResume;

  useEffect(() => {
    if (!isAdapting) {
      setProgressMsg("Processing...");
      return;
    }
    const messages = jobDescription.length >= 50
      ? ["Analyzing resume...", "Generating insights...", "Tailoring to role...", "Optimizing format...", "Almost done..."]
      : ["Analyzing resume...", "Generating insights...", "Adapting to Perficient style...", "Almost done..."];
    let index = 0;
    setProgressMsg(messages[0]);
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setProgressMsg(messages[index]);
    }, 8000);
    return () => clearInterval(interval);
  }, [isAdapting, jobDescription]);

  const handleUploadSuccess = (data: ResumeData) => {
    setResumeStatus("uploaded");
    setResumeFilename(data.filename);
    setResumeUploadedAt(new Date().toISOString());
  };

  const handleSaveSuccess = () => {
    setExplanationStatus("saved");
  };

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => { abortControllerRef.current?.abort(); };
  }, []);

  const handleAdapt = () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const { signal } = controller;

    setIsLoadingInsights(true);
    setIsLoadingResume(true);
    setInsightsResult(null);
    setResumeResult(null);
    setInsightsError(null);
    setResumeError(null);

    const body = JSON.stringify({
      ...(jobDescription.length >= 50 ? { job_description: jobDescription } : {}),
    });
    const headers = { "Content-Type": "application/json" };

    fetch("/api/adapt", { method: "POST", headers, body, signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setInsightsResult(data.data);
        } else {
          setInsightsError(data.error?.message || "Failed to generate insights");
        }
      })
      .catch((e) => { if (e.name !== "AbortError") setInsightsError("Network error. Please try again."); })
      .finally(() => setIsLoadingInsights(false));

    fetch("/api/adapt/resume", { method: "POST", headers, body, signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setResumeResult(data.data.adapted_resume);
        } else {
          setResumeError(data.error?.message || "Failed to generate resume");
        }
      })
      .catch((e) => { if (e.name !== "AbortError") setResumeError("Network error. Please try again."); })
      .finally(() => setIsLoadingResume(false));
  };

  const canTailor = resumeStatus === "uploaded" && !isAdapting;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 bg-[#f5f4f0]">
        <div className="flex items-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            className="text-black"
          >
            <path d="M9 1L17 9L9 17L1 9L9 1Z" fill="currentColor" />
          </svg>
          <span className="font-bold tracking-widest text-sm uppercase">
            Perficient CareerFit
          </span>
        </div>
      </header>

      {/* Main two-column layout */}
      <div className="main-layout flex flex-col flex-1 overflow-y-auto">
        {/* Left column */}
        <div className="main-col-left w-full flex flex-col gap-3 p-4 border-b border-gray-200">
          <ResumeUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={() => {}}
            currentStatus={resumeStatus}
            currentFilename={resumeFilename}
            uploadedAt={resumeUploadedAt}
          />

          <ExplanationInput
            onSaveSuccess={handleSaveSuccess}
            onSaveError={() => {}}
            currentStatus={explanationStatus}
            initialContent={explanationContent}
            initialFormattedMd={explanationFormattedMd}
          />

          <JobDescriptionInput
            value={jobDescription}
            onChange={setJobDescription}
            isLoading={isAdapting}
            resumeExists={resumeStatus === "uploaded"}
          />

          <button
            onClick={handleAdapt}
            disabled={!canTailor}
            className={`w-full py-3 text-sm font-medium tracking-wide transition-colors rounded ${
              canTailor
                ? "bg-black text-white hover:bg-gray-800 cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isAdapting ? progressMsg : "Tailor Resume →"}
          </button>

          {!canTailor && !isAdapting && (
            <p className="text-xs text-gray-400 text-center -mt-1">
              Upload your resume to continue.
            </p>
          )}
        </div>

        {/* Right column */}
        <div className="main-col-right w-full flex flex-col min-h-[400px]">
          <ResultsPanel
            insightsResult={insightsResult}
            resumeResult={resumeResult}
            isLoadingInsights={isLoadingInsights}
            isLoadingResume={isLoadingResume}
            insightsError={insightsError}
            resumeError={resumeError}
            onRetry={handleAdapt}
          />
        </div>
      </div>
    </div>
  );
}
