import {
  VideoAnalysisResult,
  ImageAnalysisResult,
  MediaAnalysisResult,
} from "@/lib/gemini";

// Saved video analysis result with storage metadata
export interface SavedVideoAnalysisResult extends VideoAnalysisResult {
  id: string;
  timestamp: number;
  fileName: string;
  type: "video";
}

// Saved image analysis result with storage metadata
export interface SavedImageAnalysisResult extends ImageAnalysisResult {
  id: string;
  timestamp: number;
  fileName: string;
  type: "image";
}

// Union type for saved results
export type SavedAnalysisResult =
  | SavedVideoAnalysisResult
  | SavedImageAnalysisResult;

const STORAGE_KEY = "saved-analysis-results";

/**
 * Save a new video analysis result to local storage
 */
export function saveVideoAnalysisResult(
  result: VideoAnalysisResult,
  fileName: string
): SavedVideoAnalysisResult {
  const savedResult: SavedVideoAnalysisResult = {
    ...result,
    id: `${Date.now()}-${fileName}`,
    timestamp: Date.now(),
    fileName,
    type: "video",
  };

  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    const existingResults = loadAllResults();
    const updatedResults = [savedResult, ...existingResults]; // Add new result at the beginning

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResults));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  return savedResult;
}

/**
 * Save a new image analysis result to local storage
 */
export function saveImageAnalysisResult(
  result: ImageAnalysisResult,
  fileName: string
): SavedImageAnalysisResult {
  const savedResult: SavedImageAnalysisResult = {
    ...result,
    id: `${Date.now()}-${fileName}`,
    timestamp: Date.now(),
    fileName,
    type: "image",
  };

  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    const existingResults = loadAllResults();
    const updatedResults = [savedResult, ...existingResults]; // Add new result at the beginning

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResults));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  return savedResult;
}

/**
 * Save a new analysis result to local storage (determines type automatically)
 */
export function saveAnalysisResult(
  result: MediaAnalysisResult,
  fileName: string
): SavedAnalysisResult {
  if ("transcript" in result || "scenes" in result) {
    return saveVideoAnalysisResult(result as VideoAnalysisResult, fileName);
  } else {
    return saveImageAnalysisResult(result as ImageAnalysisResult, fileName);
  }
}

/**
 * Load all saved analysis results from local storage
 */
export function loadAllResults(): SavedAnalysisResult[] {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const results = JSON.parse(stored) as SavedAnalysisResult[];
    // Sort by timestamp, newest first
    return results.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return [];
  }
}

/**
 * Delete a specific result by ID
 */
export function deleteResult(id: string): void {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return;
  }

  const existingResults = loadAllResults();
  const updatedResults = existingResults.filter((r) => r.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResults));
  } catch (error) {
    console.error("Error deleting from localStorage:", error);
  }
}

/**
 * Clear all saved results
 */
export function clearAllResults(): void {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
}
