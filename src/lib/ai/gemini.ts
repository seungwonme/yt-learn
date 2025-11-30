import { GoogleGenerativeAI } from '@google/generative-ai';
import type { VideoSummary } from '@/types';
import type { GenerateSummaryParams } from './types';

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error(
    'GOOGLE_GEMINI_API_KEY is not defined in environment variables',
  );
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * 영상 자막을 분석하여 AI 요약을 생성합니다.
 * @param params 요약 생성 파라미터
 * @returns 요약 결과
 */
export async function generateSummary(
  params: GenerateSummaryParams,
): Promise<VideoSummary> {
  const { captions, videoTitle } = params;

  // 자막 길이 제한 (약 5000 토큰)
  const maxCaptionLength = 15000;
  const truncatedCaptions =
    captions.length > maxCaptionLength
      ? captions.substring(0, maxCaptionLength) + '...'
      : captions;

  const prompt = `다음은 "${videoTitle}" 영상의 한국어 자막입니다.

자막:
${truncatedCaptions}

위 자막을 분석하여 다음 형식으로 요약해주세요:

1. 전체 요약 (3-5문장으로 영상의 핵심 내용 요약)
2. 핵심 포인트 (중요한 내용을 5-7개의 불릿 포인트로 정리)
3. 주요 타임스탬프 (중요한 부분 3-5개를 시간과 함께 설명)

응답은 반드시 다음 JSON 형식으로만 작성해주세요:
{
  "overview": "전체 요약 내용",
  "keyPoints": ["포인트1", "포인트2", "포인트3", ...],
  "timestamps": [
    {"time": "00:00", "description": "설명"},
    {"time": "05:30", "description": "설명"},
    ...
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // JSON 추출 (마크다운 코드 블록 제거)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const summary: VideoSummary = JSON.parse(jsonText);

    return summary;
  } catch (error) {
    console.error('Error generating summary with Gemini:', error);
    throw new Error('AI 요약 생성 중 오류가 발생했습니다');
  }
}
