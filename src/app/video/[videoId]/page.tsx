"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { CaptionViewer } from "@/components/video/CaptionViewer";
import { SummarySection } from "@/components/video/SummarySection";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LuArrowLeft, LuRefreshCw } from "react-icons/lu";
import type { Caption, VideoSummary } from "@/types";
import type { YouTubePlayer } from "react-youtube";

export default function VideoPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.videoId as string;

  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [summary, setSummary] = useState<VideoSummary | null>(null);
  const [isCaptionsLoading, setIsCaptionsLoading] = useState(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [captionsError, setCaptionsError] = useState<string>("");
  const [summaryError, setSummaryError] = useState<string>("");

  // 자막 추출
  useEffect(() => {
    const fetchCaptions = async () => {
      setIsCaptionsLoading(true);
      setCaptionsError("");

      try {
        const response = await fetch(
          `/api/youtube/captions?videoId=${videoId}&lang=ko`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "자막 추출 실패");
        }

        const data = await response.json();

        if (!data.available) {
          setCaptionsError("이 영상에는 자막이 제공되지 않습니다");
          return;
        }

        console.log('[VideoPage] 자막 데이터 첫 5개:', data.captions.slice(0, 5).map((c, i) => ({
          index: i,
          start: c.start,
          duration: c.duration,
          text: c.text.substring(0, 30) + '...'
        })));
        setCaptions(data.captions);
      } catch (error) {
        console.error("Error fetching captions:", error);
        setCaptionsError(
          error instanceof Error ? error.message : "자막 추출 중 오류 발생"
        );
      } finally {
        setIsCaptionsLoading(false);
      }
    };

    fetchCaptions();
  }, [videoId]);

  // AI 요약 생성
  const generateSummary = async (captionsList: Caption[]) => {
    setIsSummaryLoading(true);
    setSummaryError("");

    try {
      const captionsText = captionsList.map((c) => c.text).join(" ");

      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          captions: captionsText,
          videoTitle: "YouTube Video",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "AI 요약 생성 실패");
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummaryError(
        error instanceof Error ? error.message : "AI 요약 생성 중 오류 발생"
      );
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // 플레이어 준비
  const handlePlayerReady = (ytPlayer: YouTubePlayer) => {
    setPlayer(ytPlayer);
  };

  // 자막 클릭 시 해당 시간으로 이동
  const handleCaptionClick = (time: number) => {
    console.log(`[VideoPage] handleCaptionClick 호출 - 이동할 시간: ${time}초`);
    if (player && player.seekTo) {
      console.log(`[VideoPage] player.seekTo(${time}) 실행`);
      player.seekTo(time, true);
    } else {
      console.log('[VideoPage] player가 준비되지 않음');
    }
  };

  // 타임스탬프 클릭 시 해당 시간으로 이동
  const handleTimestampClick = (timeStr: string) => {
    const parts = timeStr.split(":").map(Number);
    let seconds = 0;

    if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    if (player && player.seekTo) {
      player.seekTo(seconds, true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="gap-2"
          >
            <LuArrowLeft className="h-4 w-4" />
            검색으로 돌아가기
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측: 영상 플레이어 & 자막 */}
          <div className="lg:col-span-2 space-y-6">
            <VideoPlayer
              videoId={videoId}
              onReady={handlePlayerReady}
              onTimeUpdate={setCurrentTime}
            />

            {/* 자막 로딩 중 */}
            {isCaptionsLoading && (
              <Card>
                <CardHeader>
                  <CardTitle>자막</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    자막을 추출하는 중입니다...
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 자막 표시 */}
            {!isCaptionsLoading && captions.length > 0 && (
              <CaptionViewer
                captions={captions}
                currentTime={currentTime}
                onCaptionClick={handleCaptionClick}
              />
            )}

            {/* 자막 에러 */}
            {!isCaptionsLoading && captionsError && (
              <Card>
                <CardHeader>
                  <CardTitle>자막</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
                    <p className="text-sm text-destructive">{captionsError}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 우측: AI 요약 */}
          <div className="lg:col-span-1 space-y-4">
            {/* AI 요약 재생성 버튼 */}
            {!isCaptionsLoading && captions.length > 0 && !isSummaryLoading && (
              <Button
                onClick={() => generateSummary(captions)}
                variant="outline"
                className="w-full gap-2"
                disabled={isSummaryLoading}
              >
                <LuRefreshCw className={`h-4 w-4 ${isSummaryLoading ? 'animate-spin' : ''}`} />
                {summary ? 'AI 요약 재생성' : 'AI 요약 생성'}
              </Button>
            )}

            <SummarySection
              summary={summary}
              isLoading={isSummaryLoading}
              error={summaryError}
              onTimestampClick={handleTimestampClick}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
