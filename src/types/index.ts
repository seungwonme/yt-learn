// YouTube 관련 타입
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
  channelTitle: string;
  publishedAt: string;
}

export interface YouTubeSearchResponse {
  videos: YouTubeVideo[];
  nextPageToken?: string;
}

// 자막 관련 타입
export interface Caption {
  text: string;
  start: number;
  duration: number;
}

export interface CaptionResponse {
  captions: Caption[];
  language: string;
  available: boolean;
}

// AI 요약 관련 타입
export interface VideoSummary {
  overview: string;
  keyPoints: string[];
  timestamps: {
    time: string;
    description: string;
  }[];
}

export interface SummarizeRequest {
  captions: string;
  videoTitle: string;
}

export interface SummarizeResponse {
  summary: VideoSummary;
}

// API 에러 응답 타입
export interface APIError {
  error: string;
  details?: string;
}
