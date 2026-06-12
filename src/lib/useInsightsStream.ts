"use client";

import { useState, useCallback, useRef } from "react";
import { Strength, Gap, TransferableSkill } from "@/contracts/adapt.contract";

export interface UseInsightsStreamReturn {
  startStream: (body: object, signal: AbortSignal) => void;
  strengths: Strength[] | null;
  gaps: Gap[] | null;
  transferableSkills: TransferableSkill[] | null;
  isStreaming: boolean;
  error: string | null;
  reset: () => void;
}

function parseSseFrames(text: string): { event: string; data: string }[] {
  const frames: { event: string; data: string }[] = [];
  const blocks = text.split("\n\n");

  for (const block of blocks) {
    if (!block.trim()) continue;
    let event = "message";
    let data = "";
    for (const line of block.split("\n")) {
      if (line.startsWith("event: ")) {
        event = line.slice(7);
      } else if (line.startsWith("data: ")) {
        data += line.slice(6);
      }
    }
    if (data) {
      frames.push({ event, data });
    }
  }

  return frames;
}

export function useInsightsStream(): UseInsightsStreamReturn {
  const [strengths, setStrengths] = useState<Strength[] | null>(null);
  const [gaps, setGaps] = useState<Gap[] | null>(null);
  const [transferableSkills, setTransferableSkills] = useState<TransferableSkill[] | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRef = useRef(false);

  const reset = useCallback(() => {
    setStrengths(null);
    setGaps(null);
    setTransferableSkills(null);
    setIsStreaming(false);
    setError(null);
  }, []);

  const startStream = useCallback((body: object, signal: AbortSignal) => {
    reset();
    setIsStreaming(true);
    activeRef.current = true;

    (async () => {
      try {
        const response = await fetch("/api/adapt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const msg = errorData?.error?.message || `Server error (${response.status})`;
          if (activeRef.current) {
            setError(msg);
            setIsStreaming(false);
          }
          return;
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("text/event-stream")) {
          const data = await response.json().catch(() => null);
          if (activeRef.current) {
            if (data?.success && data?.data) {
              setStrengths(data.data.strengths || []);
              setGaps(data.data.gaps || []);
              setTransferableSkills(data.data.transferable_skills || []);
            } else {
              setError(data?.error?.message || "Unexpected response format");
            }
            setIsStreaming(false);
          }
          return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let partial = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          partial += decoder.decode(value, { stream: true });

          const lastDoubleNewline = partial.lastIndexOf("\n\n");
          if (lastDoubleNewline === -1) continue;

          const complete = partial.slice(0, lastDoubleNewline + 2);
          partial = partial.slice(lastDoubleNewline + 2);

          const frames = parseSseFrames(complete);
          for (const frame of frames) {
            if (!activeRef.current) return;

            if (frame.event === "section") {
              try {
                const payload = JSON.parse(frame.data);
                switch (payload.type) {
                  case "strengths":
                    setStrengths(payload.data);
                    break;
                  case "gaps":
                    setGaps(payload.data);
                    break;
                  case "transferable_skills":
                    setTransferableSkills(payload.data);
                    break;
                }
              } catch {
                // Skip malformed frame
              }
            } else if (frame.event === "error") {
              try {
                const payload = JSON.parse(frame.data);
                setError(payload.message || "Stream error");
              } catch {
                setError("Stream error");
              }
            }
            // 'done' event — stream will end naturally
          }
        }

        if (activeRef.current) {
          setIsStreaming(false);
        }
      } catch (e: any) {
        if (e.name === "AbortError") return;
        if (activeRef.current) {
          setError("Network error. Please try again.");
          setIsStreaming(false);
        }
      }
    })();

    return () => {
      activeRef.current = false;
    };
  }, [reset]);

  return { startStream, strengths, gaps, transferableSkills, isStreaming, error, reset };
}
