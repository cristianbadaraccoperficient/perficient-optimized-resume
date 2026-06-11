"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface ResumeData {
  filename: string;
  parsed_length: number;
  sections_detected: string[];
}

interface ResumeUploadProps {
  onUploadSuccess: (data: ResumeData) => void;
  onUploadError: (error: string) => void;
  currentStatus: "idle" | "uploaded";
  currentFilename?: string | null;
  uploadedAt?: string | null;
}

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ResumeUpload({
  onUploadSuccess,
  onUploadError,
  currentStatus,
  currentFilename,
  uploadedAt,
}: ResumeUploadProps) {
  const [state, setState] = useState<
    "idle" | "dragging" | "uploading" | "uploaded" | "error"
  >(currentStatus === "uploaded" ? "uploaded" : "idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(currentFilename || null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentStatus === "uploaded") {
      setState("uploaded");
      setFilename(currentFilename || null);
    }
  }, [currentStatus, currentFilename]);

  const validateFile = (file: File): string | null => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return "Only PDF, DOCX, and TXT files are accepted";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File must be under 5MB";
    }
    return null;
  };

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setState("error");
        setErrorMessage(validationError);
        onUploadError(validationError);
        return;
      }

      setState("uploading");
      setFilename(file.name);
      setStatusMessage(`Uploading ${file.name}...`);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/resume", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          const message = data.error?.message || "Failed to upload resume";
          setState("error");
          setErrorMessage(message);
          setStatusMessage(message);
          onUploadError(message);
          return;
        }

        setState("uploaded");
        setFilename(data.data.filename);
        setStatusMessage(`${data.data.filename} uploaded successfully`);
        onUploadSuccess(data.data);
      } catch {
        const message = "Connection failed. Check your network.";
        setState("error");
        setErrorMessage(message);
        setStatusMessage(message);
        onUploadError(message);
      }
    },
    [onUploadSuccess, onUploadError],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (state !== "uploading") setState("dragging");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (state === "dragging") setState("idle");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (state === "uploading") return;
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleClick = () => {
    if (state === "uploading") return;
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReset = () => {
    setState("idle");
    setErrorMessage(null);
    setFilename(null);
    setStatusMessage("");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div aria-live="polite" className="sr-only">{statusMessage}</div>

      {/* Card header */}
      <div className="px-4 pt-3 pb-2">
        <span className="text-xs font-semibold tracking-widest uppercase text-gray-500">
          (01) Source Document
        </span>
      </div>

      {/* Card body */}
      <div className="px-4 pb-4">
        {state === "uploaded" ? (
          <div className="border border-gray-200 rounded p-4 text-center">
            <svg className="mx-auto h-7 w-7 text-gray-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium text-gray-800">{filename}</p>
            {uploadedAt && (
              <p className="text-xs text-gray-400 mt-1">
                Uploaded {new Date(uploadedAt).toLocaleDateString()}
              </p>
            )}
            <button
              onClick={handleReset}
              className="mt-3 text-xs text-gray-500 underline hover:text-gray-800"
            >
              Re-upload
            </button>
          </div>
        ) : state === "error" ? (
          <div className="border border-red-200 bg-red-50 rounded p-4 text-center">
            <p className="text-sm text-red-700" role="alert">{errorMessage}</p>
            <button
              onClick={handleReset}
              className="mt-3 text-xs text-red-600 underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload resume file"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={`border-2 border-dashed rounded p-6 text-center cursor-pointer transition-colors ${
              state === "dragging"
                ? "border-gray-500 bg-gray-50"
                : state === "uploading"
                  ? "border-gray-200 bg-gray-50 cursor-wait"
                  : "border-gray-200 hover:border-gray-400"
            }`}
          >
            {state === "uploading" ? (
              <>
                <div className="animate-spin mx-auto h-7 w-7 border-2 border-gray-800 border-t-transparent rounded-full mb-2" />
                <p className="text-xs text-gray-500">{filename}</p>
              </>
            ) : (
              <>
                {/* Document icon */}
                <svg className="mx-auto h-8 w-8 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-700 mb-1">Drop your resume here</p>
                <p className="text-xs text-gray-400 mb-3">.pdf, .docx, or .txt — up to 5 MB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleClick(); }}
                  className="px-4 py-1.5 bg-black text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors"
                >
                  Choose file
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
