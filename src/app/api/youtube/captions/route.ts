import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchCaptions } from "@/lib/youtube/captions";
import type { CaptionResponse, APIError } from "@/types";

// 요청 파라미터 검증 스키마
const captionsParamsSchema = z.object({
  videoId: z.string().min(1, "영상 ID가 필요합니다"),
  lang: z.string().length(2).optional().default("ko"),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get("videoId");
    const lang = searchParams.get("lang");

    // 입력 검증
    const validatedParams = captionsParamsSchema.parse({
      videoId,
      lang: lang || "ko",
    });

    // 자막 추출
    const result = await fetchCaptions({
      videoId: validatedParams.videoId,
      lang: validatedParams.lang,
    });

    const response: CaptionResponse = {
      captions: result.captions,
      language: result.language,
      available: result.available,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("YouTube captions API error:", error);

    if (error instanceof z.ZodError) {
      const errorResponse: APIError = {
        error: "입력값이 올바르지 않습니다",
        details: error.issues.map((e) => e.message).join(", "),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const errorResponse: APIError = {
      error: "자막 추출 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "Unknown error",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
