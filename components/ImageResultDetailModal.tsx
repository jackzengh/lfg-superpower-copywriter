"use client";

import { SavedImageAnalysisResult } from "@/lib/storage";
import { useState, useEffect } from "react";

interface ImageResultDetailModalProps {
  result: SavedImageAnalysisResult | null;
  onClose: () => void;
}

export default function ImageResultDetailModal({
  result,
  onClose,
}: ImageResultDetailModalProps) {
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
                IMAGE
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
                Image Description
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

          {/* Ad Copy */}
          {result.adCopy && result.adCopy.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-4">
                Ad Copy
              </h3>
              <div className="border border-border rounded-xl p-6 space-y-4">
                {result.adCopy.map((copy, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <p className="text-secondary leading-relaxed">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Visual Elements */}
          {result.visualElements && result.visualElements.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-4">
                Key Visual Elements
              </h3>
              <div className="border border-border rounded-xl p-6">
                <div className="flex flex-wrap gap-2">
                  {result.visualElements.map((element, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {element}
                    </span>
                  ))}
                </div>
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
