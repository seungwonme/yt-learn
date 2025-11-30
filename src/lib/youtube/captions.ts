import { YoutubeTranscript } from "@danielxceron/youtube-transcript";
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
 * @danielxceron/youtube-transcript를 사용 (InnerTube API 폴백 지원)
 * @param params 자막 추출 파라미터
 * @returns 자막 데이터
 */
export async function fetchCaptions(
  params: FetchCaptionsParams
): Promise<FetchCaptionsResult> {
  const { videoId, lang = "ko" } = params;

  try {
    // 자막 추출 (InnerTube API 폴백 기능 내장)
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
      lang,
    });

    // offset과 duration은 항상 밀리초 단위
    const captions: Caption[] = transcriptItems.map((item) => ({
      text: item.text,
      start: item.offset / 1000, // ms -> seconds
      duration: item.duration / 1000, // ms -> seconds
    }));

    return {
      captions,
      language: lang,
      available: true,
    };
  } catch (error) {
    console.error(`Error fetching ${lang} captions:`, error);

    // 폴백: 다른 언어로 시도
    if (lang === "ko") {
      try {
        const transcriptItems = await YoutubeTranscript.fetchTranscript(
          videoId,
          {
            lang: "en",
          }
        );

        const captions: Caption[] = transcriptItems.map((item) => ({
          text: item.text,
          start: item.offset / 1000,
          duration: item.duration / 1000,
        }));

        return {
          captions,
          language: "en",
          available: true,
        };
      } catch (enError) {
        console.error("Error fetching English captions:", enError);
      }
    }

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
