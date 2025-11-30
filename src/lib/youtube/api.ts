import type { YouTubeSearchApiResponse } from "./types";
import type { YouTubeVideo } from "@/types";

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.YOUTUBE_API_KEY as string;
const MAX_RESULTS = Number(process.env.YOUTUBE_MAX_RESULTS) || 10;

if (!API_KEY) {
  throw new Error("YOUTUBE_API_KEY is not defined in environment variables");
}

export interface SearchVideosParams {
  query: string;
  maxResults?: number;
  pageToken?: string;
}

export interface SearchVideosResult {
  videos: YouTubeVideo[];
  nextPageToken?: string;
}

/**
 * YouTube Data API v3를 사용하여 영상을 검색합니다.
 * @param params 검색 파라미터
 * @returns 검색 결과
 */
export async function searchVideos(
  params: SearchVideosParams
): Promise<SearchVideosResult> {
  const { query, maxResults = MAX_RESULTS, pageToken } = params;

  const url = new URL(`${YOUTUBE_API_BASE_URL}/search`);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("key", API_KEY);

  if (pageToken) {
    url.searchParams.set("pageToken", pageToken);
  }

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `YouTube API Error: ${response.status} ${response.statusText}. ${
          error.error?.message || ""
        }`
      );
    }

    const data: YouTubeSearchApiResponse = await response.json();

    const videos: YouTubeVideo[] = data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: {
        url: item.snippet.thumbnails.high.url,
        width: item.snippet.thumbnails.high.width,
        height: item.snippet.thumbnails.high.height,
      },
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));

    return {
      videos,
      nextPageToken: data.nextPageToken,
    };
  } catch (error) {
    console.error("Error searching YouTube videos:", error);
    throw error;
  }
}
