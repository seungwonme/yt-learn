"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { LuClock, LuCircleCheck } from "react-icons/lu";
import type { VideoSummary } from "@/types";

interface SummarySectionProps {
  summary: VideoSummary | null;
  isLoading: boolean;
  error?: string;
  onTimestampClick?: (time: string) => void;
}

export function SummarySection({
  summary,
  isLoading,
  error,
  onTimestampClick,
}: SummarySectionProps) {
  // 로딩 상태
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI 요약</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyTitle>요약 생성 실패</EmptyTitle>
              <EmptyDescription>{error}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  // 요약 없음
  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyTitle>AI 요약이 생성되지 않았습니다</EmptyTitle>
              <EmptyDescription>
                상단의 &apos;AI 요약 생성&apos; 버튼을 클릭해주세요
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  // 시간 문자열을 초로 변환
  const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI 요약</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 전체 요약 */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <LuCircleCheck className="h-4 w-4" />
            전체 요약
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary.overview}
          </p>
        </div>

        {/* 핵심 포인트 */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <LuCircleCheck className="h-4 w-4" />
            핵심 포인트
          </h3>
          <ul className="space-y-2">
            {summary.keyPoints.map((point, index) => (
              <li key={index} className="text-sm text-muted-foreground flex">
                <span className="mr-2">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 주요 타임스탬프 */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <LuClock className="h-4 w-4" />
            주요 타임스탬프
          </h3>
          <div className="space-y-2">
            {summary.timestamps.map((timestamp, index) => (
              <button
                key={index}
                onClick={() => onTimestampClick?.(timestamp.time)}
                className="w-full text-left p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <div className="font-mono text-xs text-primary mb-1">
                  {timestamp.time}
                </div>
                <div className="text-sm text-muted-foreground">
                  {timestamp.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
