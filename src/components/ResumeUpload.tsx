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
  const [filename, setFilename] = useState<string | null>(
    currentFilename || null,
  );
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
    if (state !== "uploading") {
      setState("dragging");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (state === "dragging") {
      setState("idle");
    }
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
    <div className="w-full">
      <div aria-live="polite" className="sr-only">
        {statusMessage}
      </div>

      {state === "uploaded" ? (
        <div className="border-2 border-green-300 bg-green-50 rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-8 w-8 text-green-500 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <p className="text-sm font-medium text-green-800">{filename}</p>
          {uploadedAt && (
            <p className="text-xs text-green-600 mt-1">
              Uploaded {new Date(uploadedAt).toLocaleDateString()}
            </p>
          )}
          <button
            onClick={handleReset}
            className="mt-3 text-sm text-green-700 underline hover:text-green-900"
          >
            Re-upload
          </button>
        </div>
      ) : state === "error" ? (
        <div className="border-2 border-red-300 bg-red-50 rounded-lg p-6 text-center">
          <p className="text-sm text-red-700" role="alert" id="upload-error">
            {errorMessage}
          </p>
          <button
            onClick={handleReset}
            className="mt-3 text-sm text-red-700 underline hover:text-red-900"
          >
            Try again
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload resume file"
          aria-describedby={errorMessage ? "upload-error" : undefined}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            state === "dragging"
              ? "border-blue-500 bg-blue-50"
              : state === "uploading"
                ? "border-gray-300 bg-gray-50 cursor-wait"
                : "border-gray-300 hover:border-gray-400"
          }`}
        >
          {state === "uploading" ? (
            <>
              <div className="animate-spin mx-auto h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mb-2" />
              <p className="text-sm text-gray-600">{filename}</p>
            </>
          ) : state === "dragging" ? (
            <>
              <svg
                className="mx-auto h-10 w-10 text-blue-500 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm font-medium text-blue-600">
                Drop file here
              </p>
            </>
          ) : (
            <>
              <svg
                className="mx-auto h-10 w-10 text-gray-400 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm font-medium text-gray-700">Upload Resume</p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOCX, or TXT (max 5MB)
              </p>
            </>
          )}
        </div>
      )}

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
