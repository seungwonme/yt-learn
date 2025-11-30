// Gemini API 관련 타입
export interface GeminiConfig {
  apiKey: string;
  model?: string;
}

export interface GenerateSummaryParams {
  captions: string;
  videoTitle: string;
}
