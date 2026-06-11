"use client";

import { useState, useEffect } from "react";
import ResumeUpload from "@/components/ResumeUpload";
import ExplanationInput from "@/components/ExplanationInput";
import JobDescriptionInput from "@/components/JobDescriptionInput";
import ResultsPanel from "@/components/ResultsPanel";
import { AdaptationResult } from "@/contracts/adapt.contract";

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
  const [adaptationResult, setAdaptationResult] =
    useState<AdaptationResult | null>(null);
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptError, setAdaptError] = useState<string | null>(null);

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

  const handleUploadSuccess = (data: ResumeData) => {
    setResumeStatus("uploaded");
    setResumeFilename(data.filename);
    setResumeUploadedAt(new Date().toISOString());
  };

  const handleSaveSuccess = () => {
    setExplanationStatus("saved");
  };

  const handleAdapt = async () => {
    if (!jobDescription || jobDescription.length < 50) return;
    setIsAdapting(true);
    setAdaptError(null);

    try {
      const response = await fetch("/api/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: jobDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAdaptError(data.error?.message || "Failed to adapt resume");
        setAdaptationResult(null);
      } else {
        setAdaptationResult(data.data);
        setAdaptError(null);
      }
    } catch {
      setAdaptError("Network error. Please try again.");
      setAdaptationResult(null);
    } finally {
      setIsAdapting(false);
    }
  };

  const canTailor =
    resumeStatus === "uploaded" && jobDescription.length >= 50 && !isAdapting;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#f5f4f0]">
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
      <div className="flex flex-1 overflow-hidden">
        {/* Left column */}
        <div className="w-1/2 flex flex-col gap-3 p-4 overflow-y-auto border-r border-gray-200">
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
            {isAdapting ? "Processing..." : "Tailor Resume →"}
          </button>

          {!canTailor && !isAdapting && (
            <p className="text-xs text-gray-400 text-center -mt-1">
              {resumeStatus !== "uploaded"
                ? "Upload a resume and paste a job description (50+ characters) to continue."
                : jobDescription.length < 50
                  ? "Upload a resume and paste a job description (50+ characters) to continue."
                  : ""}
            </p>
          )}
        </div>

        {/* Right column */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <ResultsPanel
            adaptationResult={adaptationResult}
            isLoading={isAdapting}
            error={adaptError}
            onRetry={handleAdapt}
          />
        </div>
      </div>
    </div>
  );
}
