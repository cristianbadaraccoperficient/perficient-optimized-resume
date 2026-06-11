'use client';

import { useState, useEffect } from 'react';
import ResumeUpload from '@/components/ResumeUpload';
import ExplanationInput from '@/components/ExplanationInput';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import ResultsPanel from '@/components/ResultsPanel';
import { AdaptationResult } from '@/contracts/adapt.contract';

interface ResumeData {
  filename: string;
  parsed_length: number;
  sections_detected: string[];
}

export default function Home() {
  const [resumeStatus, setResumeStatus] = useState<'idle' | 'uploaded'>('idle');
  const [resumeFilename, setResumeFilename] = useState<string | null>(null);
  const [resumeUploadedAt, setResumeUploadedAt] = useState<string | null>(null);
  const [explanationStatus, setExplanationStatus] = useState<'idle' | 'saved'>('idle');
  const [explanationContent, setExplanationContent] = useState<string | null>(null);
  const [adaptationResult, setAdaptationResult] = useState<AdaptationResult | null>(null);
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptError, setAdaptError] = useState<string | null>(null);
  const [lastJobDescription, setLastJobDescription] = useState<string>('');

  useEffect(() => {
    async function loadExisting() {
      try {
        const [resumeRes, explanationRes] = await Promise.all([
          fetch('/api/resume'),
          fetch('/api/explanation'),
        ]);

        const resumeData = await resumeRes.json();
        if (resumeData.exists) {
          setResumeStatus('uploaded');
          setResumeFilename(resumeData.original_filename);
          setResumeUploadedAt(resumeData.uploaded_at);
        }

        const explanationData = await explanationRes.json();
        if (explanationData.exists) {
          setExplanationStatus('saved');
          setExplanationContent(explanationData.content);
        }
      } catch {
        // Silent fail on initial load
      }
    }

    loadExisting();
  }, []);

  const handleUploadSuccess = (data: ResumeData) => {
    setResumeStatus('uploaded');
    setResumeFilename(data.filename);
    setResumeUploadedAt(new Date().toISOString());
  };

  const handleUploadError = () => {
    // Error state handled within the component
  };

  const handleSaveSuccess = () => {
    setExplanationStatus('saved');
  };

  const handleSaveError = () => {
    // Error state handled within the component
  };

  const handleAdapt = async (jobDescription: string) => {
    setIsAdapting(true);
    setAdaptError(null);
    setLastJobDescription(jobDescription);

    try {
      const response = await fetch('/api/adapt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_description: jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAdaptError(data.error?.message || 'Failed to adapt resume');
        setAdaptationResult(null);
      } else {
        setAdaptationResult(data.data);
        setAdaptError(null);
      }
    } catch (error) {
      setAdaptError('Network error. Please try again.');
      setAdaptationResult(null);
    } finally {
      setIsAdapting(false);
    }
  };

  const handleRetry = () => {
    if (lastJobDescription) {
      handleAdapt(lastJobDescription);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Resume Optimizer</h1>
      <p className="mt-2 text-gray-600">
        Upload your resume and provide context to optimize it for specific job descriptions.
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">1. Upload Resume</h2>
        <ResumeUpload
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          currentStatus={resumeStatus}
          currentFilename={resumeFilename}
          uploadedAt={resumeUploadedAt}
        />
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">2. Explanation</h2>
        <p className="text-sm text-gray-600 mb-3">
          Provide additional background about your experience that isn't in your resume.
        </p>
        <ExplanationInput
          onSaveSuccess={handleSaveSuccess}
          onSaveError={handleSaveError}
          currentStatus={explanationStatus}
          initialContent={explanationContent}
        />
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">3. Job Description</h2>
        <JobDescriptionInput
          onAdapt={handleAdapt}
          isLoading={isAdapting}
          resumeExists={resumeStatus === 'uploaded'}
          error={adaptError}
        />
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">4. Results</h2>
        <ResultsPanel
          adaptationResult={adaptationResult}
          isLoading={isAdapting}
          error={adaptError}
          onRetry={handleRetry}
        />
      </section>
    </div>
  );
}
