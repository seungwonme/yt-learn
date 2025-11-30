'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { LuCopy, LuCheck } from 'react-icons/lu';
import type { Caption } from '@/types';

interface CaptionViewerProps {
  captions: Caption[];
  currentTime?: number;
  onCaptionClick?: (time: number) => void;
}

export function CaptionViewer({
  captions,
  currentTime = 0,
  onCaptionClick,
}: CaptionViewerProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // 타임스탬프를 미리 포맷팅하여 메모이제이션 (깜빡임 방지)
  const formattedCaptions = useMemo(() => {
    return captions.map((caption) => {
      const minutes = Math.floor(caption.start / 60);
      const seconds = Math.floor(caption.start % 60);
      return {
        ...caption,
        formattedTime: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      };
    });
  }, [captions]);

  // 현재 재생 중인 자막 찾기
  // 여러 자막이 겹칠 때, 가장 최근에 시작된 자막을 선택
  // useMemo로 메모이제이션하여 불필요한 재계산 방지
  const currentCaptionIndex = useMemo(() => {
    for (let i = captions.length - 1; i >= 0; i--) {
      if (
        currentTime >= captions[i].start &&
        currentTime < captions[i].start + captions[i].duration
      ) {
        return i;
      }
    }
    return -1;
  }, [captions, currentTime]);

  // 활성 자막으로 스크롤
  useEffect(() => {
    if (activeRef.current && scrollAreaRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentCaptionIndex]);

  const handleCopyCaptions = async () => {
    const captionsText = captions.map((caption) => caption.text).join('\n');

    try {
      await navigator.clipboard.writeText(captionsText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy captions:', err);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>자막</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyCaptions}
          className="gap-2"
        >
          {copied ? (
            <>
              <LuCheck className="h-4 w-4" />
              복사됨
            </>
          ) : (
            <>
              <LuCopy className="h-4 w-4" />
              자막 복사
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]" ref={scrollAreaRef}>
          <div className="space-y-2">
            {formattedCaptions.map((caption, index) => (
              <div
                key={index}
                ref={index === currentCaptionIndex ? activeRef : null}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  index === currentCaptionIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
                onClick={() => {
                  console.log(
                    `[CaptionViewer] 자막 클릭 - index: ${index}, start: ${
                      caption.start
                    }초, text: "${caption.text.substring(0, 30)}..."`,
                  );
                  onCaptionClick?.(caption.start);
                }}
              >
                <div className="text-xs font-mono mb-1 opacity-70">
                  {caption.formattedTime}
                </div>
                <div className="text-sm">{caption.text}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
