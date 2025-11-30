import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchVideos } from "@/lib/youtube/api";
import type { YouTubeSearchResponse, APIError } from "@/types";

// 요청 파라미터 검증 스키마
const searchParamsSchema = z.object({
  q: z.string().min(1, "검색어를 입력해주세요").max(100),
  maxResults: z.coerce.number().min(1).max(50).optional(),
  pageToken: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q");
    const maxResults = searchParams.get("maxResults");
    const pageToken = searchParams.get("pageToken");

    // 입력 검증
    const validatedParams = searchParamsSchema.parse({
      q,
      maxResults: maxResults ? Number(maxResults) : undefined,
      pageToken: pageToken || undefined,
    });

    // YouTube API 호출
    const result = await searchVideos({
      query: validatedParams.q,
      maxResults: validatedParams.maxResults,
      pageToken: validatedParams.pageToken,
    });

    const response: YouTubeSearchResponse = {
      videos: result.videos,
      nextPageToken: result.nextPageToken,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("YouTube search API error:", error);

    if (error instanceof z.ZodError) {
      const errorResponse: APIError = {
        error: "입력값이 올바르지 않습니다",
        details: error.issues.map((e) => e.message).join(", "),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const errorResponse: APIError = {
      error: "영상 검색 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "Unknown error",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
