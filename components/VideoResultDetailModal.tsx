"use client";

import { SavedVideoAnalysisResult } from "@/lib/storage";
import { useState, useEffect } from "react";

interface VideoResultDetailModalProps {
  result: SavedVideoAnalysisResult | null;
  onClose: () => void;
}

export default function VideoResultDetailModal({
  result,
  onClose,
}: VideoResultDetailModalProps) {
  const [showDescription, setShowDescription] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (result) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [result]);

  if (!result) return null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-black border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-border p-8 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                VIDEO
              </span>
              <span className="text-secondary text-sm">
                {formatDate(result.timestamp)}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-black dark:text-white">
              {result.fileName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-primary/10 rounded-lg transition-colors group"
            title="Close"
          >
            <svg
              className="w-6 h-6 text-secondary group-hover:text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Collapsible Description Section */}
          <div>
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="w-full flex items-center justify-between px-6 py-4 border border-border rounded-xl hover:border-primary transition-colors"
            >
              <h3 className="text-xl font-semibold text-black dark:text-white">
                Video Description
              </h3>
              <svg
                className={`w-5 h-5 text-secondary transition-transform ${
                  showDescription ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showDescription && (
              <div className="mt-4 border border-border rounded-xl p-6">
                <p className="text-secondary leading-relaxed whitespace-pre-wrap">
                  {result.description}
                </p>
              </div>
            )}
          </div>

          {/* Claude Ad Copy Section */}
          {result.claudeAdCopy && (
            <div>
              <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">
                AI-Generated Ad Copy
              </h3>
              <div className="bg-primary/5 rounded-2xl p-8 space-y-6 border border-primary/20">
                {/* Headline */}
                <div>
                  <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">
                    HEADLINE
                  </p>
                  <h4 className="text-3xl font-bold text-black dark:text-white leading-tight">
                    {result.claudeAdCopy.headline}
                  </h4>
                </div>
                {/* Description */}
                <div>
                  <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">
                    AD DESCRIPTION
                  </p>
                  <p className="text-foreground text-lg leading-relaxed whitespace-pre-wrap">
                    {result.claudeAdCopy.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Scene Breakdown */}
          {result.scenes && result.scenes.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-4">
                Scene Breakdown
              </h3>
              <div className="border border-border rounded-xl p-6 space-y-3">
                {result.scenes.map((scene, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <span className="flex-shrink-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <p className="text-secondary flex-1 leading-relaxed">
                      {scene}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transcript */}
          {result.transcript && (
            <div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-4">
                Transcript
              </h3>
              <div className="border border-border rounded-xl p-6 max-h-96 overflow-y-auto">
                <p className="text-secondary whitespace-pre-wrap leading-relaxed">
                  {result.transcript}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-black border-t border-border p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
