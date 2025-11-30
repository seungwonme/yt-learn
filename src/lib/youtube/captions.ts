import { Innertube } from "youtubei.js";
import type { Caption } from "@/types";

export interface FetchCaptionsParams {
  videoId: string;
  lang?: string;
}

export interface FetchCaptionsResult {
  captions: Caption[];
  language: string;
  available: boolean;
}

/**
 * YouTube 영상의 자막을 추출합니다.
 * youtubei.js를 사용 (InnerTube API 직접 사용)
 * @param params 자막 추출 파라미터
 * @returns 자막 데이터
 */
export async function fetchCaptions(
  params: FetchCaptionsParams
): Promise<FetchCaptionsResult> {
  const { videoId, lang = "ko" } = params;

  try {
    // Innertube 클라이언트 생성
    const youtube = await Innertube.create();

    // 영상 정보 가져오기
    const info = await youtube.getInfo(videoId);

    // 자막 데이터 추출
    const transcriptData = await info.getTranscript();

    // 자막이 없는 경우
    if (!transcriptData || !transcriptData.transcript?.content?.body?.initial_segments) {
      console.error(`No transcript available for video: ${videoId}`);
      return {
        captions: [],
        language: lang,
        available: false,
      };
    }

    const segments = transcriptData.transcript.content.body.initial_segments;

    // youtubei.js 응답을 learning-yt Caption 타입으로 변환
    const captions: Caption[] = segments
      .map((segment: any) => ({
        text: segment.snippet.text,
        start: segment.start_ms / 1000, // ms → seconds
        duration: (segment.end_ms - segment.start_ms) / 1000, // ms → seconds
      }))
      .sort((a, b) => a.start - b.start); // start 시간 기준 오름차순 정렬

    console.log(`[fetchCaptions] Successfully fetched ${captions.length} captions for video: ${videoId}`);

    return {
      captions,
      language: lang,
      available: true,
    };
  } catch (error) {
    console.error(`Error fetching captions for video ${videoId}:`, error);

    return {
      captions: [],
      language: lang,
      available: false,
    };
  }
}

/**
 * 자막 배열을 하나의 텍스트로 결합합니다.
 * @param captions 자막 배열
 * @returns 결합된 텍스트
 */
export function combineCaptionsToText(captions: Caption[]): string {
  return captions.map((caption) => caption.text).join(" ");
}
