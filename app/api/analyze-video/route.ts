import { NextRequest, NextResponse } from "next/server";
import { analyzeVideo, analyzeImage } from "@/lib/gemini";
import { generateAdCopy } from "@/lib/claude";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";

// Configure route segment for larger file uploads
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for video processing

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("video") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No media file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      return NextResponse.json(
        { error: "File must be a video or image" },
        { status: 400 }
      );
    }

    // // Validate file size (50MB limit)
    // const maxSize = 100 * 1024 * 1024; // 50MB
    // if (file.size > maxSize) {
    //   return NextResponse.json(
    //     { error: "File size must be less than 100MB" },
    //     { status: 400 }
    //   );
    // }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create temporary file path
    // In serverless environments (Vercel/Lambda), use /tmp directly
    // In local development, use a tmp directory in the project
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    const tmpDir = isServerless ? "/tmp" : join(process.cwd(), "tmp");
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = join(tmpDir, fileName);

    // Ensure tmp directory exists (only needed for local development)
    if (!isServerless) {
      try {
        const fs = await import("fs/promises");
        await fs.mkdir(tmpDir, { recursive: true });
      } catch (err) {
        console.error("Error creating tmp directory:", err);
      }
    }

    // Write file temporarily
    await writeFile(filePath, buffer);

    try {
      // Analyze media with Gemini based on type
      let result;
      if (isVideo) {
        result = await analyzeVideo(filePath, file.type);

        // Generate ad copy with Claude using the description
        try {
          const claudeAdCopy = await generateAdCopy(
            result.description,
            result.transcript,
            result.scenes
          );
          result.claudeAdCopy = claudeAdCopy;
        } catch (claudeError) {
          console.error("Error generating ad copy with Claude:", claudeError);
          // Continue without Claude ad copy if it fails
        }
      } else if (isImage) {
        result = await analyzeImage(filePath, file.type);

        // Generate ad copy with Claude using the description
        try {
          const claudeAdCopy = await generateAdCopy(result.description);
          result.claudeAdCopy = claudeAdCopy;
        } catch (claudeError) {
          console.error("Error generating ad copy with Claude:", claudeError);
          // Continue without Claude ad copy if it fails
        }
      } else {
        return NextResponse.json(
          { error: "File must be a video or image" },
          { status: 400 }
        );
      }

      // Clean up temporary file
      await unlink(filePath);

      return NextResponse.json(result);
    } catch (analysisError) {
      // Clean up temporary file even on error
      try {
        await unlink(filePath);
      } catch (unlinkError) {
        console.error("Error deleting temp file:", unlinkError);
      }

      throw analysisError;
    }
  } catch (error) {
    console.error("Error processing media:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process media",
      },
      { status: 500 }
    );
  }
}
