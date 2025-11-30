"use client";

import { VideoCard } from "@/components/video/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import type { YouTubeVideo } from "@/types";

interface SearchResultsProps {
  videos: YouTubeVideo[];
  isLoading?: boolean;
  error?: string | null;
  searchQuery?: string;
}

export function SearchResults({
  videos,
  isLoading = false,
  error = null,
  searchQuery = "",
}: SearchResultsProps) {
  // 로딩 스켈레톤
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>검색 중 오류가 발생했습니다</EmptyTitle>
          <EmptyDescription>{error}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  // 검색 결과 없음
  if (searchQuery && videos.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>검색 결과가 없습니다</EmptyTitle>
          <EmptyDescription>다른 검색어를 시도해보세요</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  // 검색 전 상태
  if (!searchQuery && videos.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>YouTube 영상을 검색해보세요</EmptyTitle>
          <EmptyDescription>
            원하는 영상을 검색하여 AI 요약을 받아보세요
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  // 검색 결과 표시
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
