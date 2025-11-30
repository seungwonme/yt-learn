import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateSummary } from "@/lib/ai/gemini";
import type { SummarizeResponse, APIError } from "@/types";

// 요청 본문 검증 스키마
const summarizeBodySchema = z.object({
  captions: z.string().min(1, "자막이 필요합니다"),
  videoTitle: z.string().min(1, "영상 제목이 필요합니다"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 입력 검증
    const validatedBody = summarizeBodySchema.parse(body);

    // AI 요약 생성
    const summary = await generateSummary({
      captions: validatedBody.captions,
      videoTitle: validatedBody.videoTitle,
    });

    const response: SummarizeResponse = {
      summary,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("AI summarize API error:", error);

    if (error instanceof z.ZodError) {
      const errorResponse: APIError = {
        error: "입력값이 올바르지 않습니다",
        details: error.issues.map((e) => e.message).join(", "),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const errorResponse: APIError = {
      error: "AI 요약 생성 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "Unknown error",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
