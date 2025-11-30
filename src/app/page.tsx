"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import type { YouTubeVideo } from "@/types";

const STORAGE_KEY = "youtube_search_state";

export default function Home() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 페이지 로드 시 저장된 검색 결과 복원
  useEffect(() => {
    const savedState = sessionStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const { query, videos: savedVideos } = JSON.parse(savedState);
        setSearchQuery(query);
        setVideos(savedVideos);
      } catch (err) {
        console.error("Failed to restore search state:", err);
      }
    }
  }, []);

  const performSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "검색 중 오류가 발생했습니다");
      }

      const data = await response.json();
      const searchResults = data.videos || [];
      setVideos(searchResults);

      // 검색 결과를 sessionStorage에 저장
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ query, videos: searchResults })
      );
    } catch (err) {
      console.error("Search error:", err);
      setError(
        err instanceof Error ? err.message : "검색 중 오류가 발생했습니다"
      );
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    await performSearch(query);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center mb-2">
            YouTube 학습 플랫폼
          </h1>
          <p className="text-center text-muted-foreground mb-6">
            YouTube 영상을 검색하고 AI 요약으로 효율적으로 학습하세요
          </p>
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <SearchResults
          videos={videos}
          isLoading={isLoading}
          error={error}
          searchQuery={searchQuery}
        />
      </main>
    </div>
  );
}
